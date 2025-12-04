// Cloudflare Turnstile type definitions
declare global {
	interface Window {
		turnstile: {
			render: (
				container: HTMLElement,
				options: {
					sitekey: string;
					callback: (token: string) => void;
					'error-callback'?: () => void;
					'expired-callback'?: () => void;
					theme?: 'light' | 'dark' | 'auto';
					size?: 'normal' | 'compact';
				}
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		};
	}
}

export {};
