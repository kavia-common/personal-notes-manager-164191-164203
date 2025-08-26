 // PUBLIC_INTERFACE
 /**
  * Returns the API base URL for the backend service.
  * Priority:
  * - REACT_APP_API_BASE_URL from environment (set via .env)
  * - Fallback to http://localhost:3001 (expected backend port in this project)
  */
 export function getApiBaseUrl() {
   /** This is a public function. */
   const envUrl = process.env.REACT_APP_API_BASE_URL;
   if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
     return envUrl.trim().replace(/\/+$/, '');
   }
   return 'http://localhost:3001';
 }
