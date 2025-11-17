import axios from 'axios';
import crypto from 'crypto';

export default (router, { services, env, getSchema }) => {
	const { UsersService } = services;

	// Configuration GitHub OAuth
	const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
	const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
	const PUBLIC_URL = env.PUBLIC_URL || 'http://localhost:8055';
	const BACKEND_CALLBACK_URL = `${PUBLIC_URL}/oauth/callback`; // Callback du backend pour GitHub
	const FRONTEND_URL = env.FRONTEND_URL || 'http://localhost:4200';

	// Route pour initier l'authentification GitHub
	router.get('/github', (req, res) => {
		const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(BACKEND_CALLBACK_URL)}&scope=user:email`;
		res.redirect(githubAuthUrl);
	});

	// Route de callback GitHub
	router.get('/callback', async (req, res) => {
		const { code } = req.query;

		if (!code) {
			return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
		}

		try {
			// Échanger le code contre un access token
			const tokenResponse = await axios.post(
				'https://github.com/login/oauth/access_token',
				{
					client_id: GITHUB_CLIENT_ID,
					client_secret: GITHUB_CLIENT_SECRET,
					code,
					redirect_uri: BACKEND_CALLBACK_URL,
				},
				{
					headers: { Accept: 'application/json' },
				}
			);

			const githubAccessToken = tokenResponse.data.access_token;
			if (!githubAccessToken) {
				return res.redirect(`${FRONTEND_URL}/login?error=no_token`);
			}

			// Récupérer les informations de l'utilisateur GitHub
			const [userResponse, emailResponse] = await Promise.all([
				axios.get('https://api.github.com/user', {
					headers: { Authorization: `Bearer ${githubAccessToken}` },
				}),
				axios.get('https://api.github.com/user/emails', {
					headers: { Authorization: `Bearer ${githubAccessToken}` },
				}),
			]);

			const githubUser = userResponse.data;
			const primaryEmail = emailResponse.data.find((email) => email.primary)?.email || githubUser.email;

			if (!primaryEmail) {
				return res.redirect(`${FRONTEND_URL}/login?error=no_email`);
			}

			const schema = await getSchema();
			const usersService = new UsersService({ schema, accountability: { admin: true } });

			// Chercher l'utilisateur par GitHub ID ou email
			const [usersByExternalId, usersByEmail] = await Promise.all([
				usersService.readByQuery({
					filter: { external_identifier: { _eq: githubUser.id.toString() } },
					limit: 1,
				}),
				usersService.readByQuery({
					filter: { email: { _eq: primaryEmail } },
					limit: 1,
				}),
			]);

			let user;
			
			if (usersByExternalId.length > 0) {
				user = usersByExternalId[0];
				if (user.email !== primaryEmail) {
					await usersService.updateOne(user.id, { email: primaryEmail });
					user.email = primaryEmail;
				}
			} else if (usersByEmail.length > 0) {
				user = usersByEmail[0];
				if (!user.external_identifier) {
					await usersService.updateOne(user.id, { 
						external_identifier: githubUser.id.toString(),
						provider: 'github'
					});
				}
			} else {
				const userId = await usersService.createOne({
					email: primaryEmail,
					first_name: githubUser.name?.split(' ')[0] || githubUser.login,
					last_name: githubUser.name?.split(' ').slice(1).join(' ') || '',
					avatar: githubUser.avatar_url,
					provider: 'github',
					external_identifier: githubUser.id.toString(),
					role: env.DEFAULT_USER_ROLE || null,
					status: 'active',
				});
				user = await usersService.readOne(userId);
			}

			// Générer les tokens JWT avec crypto
			const header = { alg: 'HS256', typ: 'JWT' };
			const now = Math.floor(Date.now() / 1000);
			
			const createJWT = (payload, expirySeconds) => {
				const fullPayload = {
					id: user.id,
					role: user.role,
					app_access: true,
					admin_access: !!user.role,
					iat: now,
					exp: now + expirySeconds,
					iss: 'directus',
					...payload
				};
				const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
				const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
				const signature = crypto
					.createHmac('sha256', env.SECRET)
					.update(`${encodedHeader}.${encodedPayload}`)
					.digest('base64url');
				return `${encodedHeader}.${encodedPayload}.${signature}`;
			};
			
			const accessToken = createJWT({}, 15 * 60); // 15 minutes
			const refreshToken = createJWT({}, 7 * 24 * 60 * 60); // 7 jours
			
			// Rediriger vers le frontend avec les tokens (nettoyés immédiatement par Angular)
			const callbackUrl = `${FRONTEND_URL}/auth/callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`;
			res.redirect(callbackUrl);
		} catch (error) {
			res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
		}
	});
};
