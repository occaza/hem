// src/lib/utils/avatar.utils.ts
import { getSupabaseClient } from '$lib/client/supabase';

export async function uploadAvatar(file: File, userId: string) {
	try {
		const supabase = getSupabaseClient();

		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			return {
				success: false,
				error: `Format tidak didukung: ${file.name}. Gunakan JPG, PNG, atau WEBP`
			};
		}

		const maxSize = 2 * 1024 * 1024; // 2MB
		if (file.size > maxSize) {
			const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
			return {
				success: false,
				error: `File terlalu besar: ${sizeMB}MB. Maksimal 2MB`
			};
		}

		const fileExt = file.name.split('.').pop();
		const fileName = `${userId}/avatar.${fileExt}`;

		const { data, error: uploadError } = await supabase.storage
			.from('avatars')
			.upload(fileName, file, {
				cacheControl: '3600',
				upsert: true
			});

		if (uploadError) {
			return {
				success: false,
				error: `Upload gagal: ${uploadError.message}`
			};
		}

		const {
			data: { publicUrl }
		} = supabase.storage.from('avatars').getPublicUrl(fileName);

		return {
			success: true,
			url: publicUrl
		};
	} catch (error) {
		console.error('Upload avatar failed:', error);
		return {
			success: false,
			error: 'Terjadi kesalahan saat upload'
		};
	}
}

export async function deleteAvatar(userId: string) {
	try {
		const supabase = getSupabaseClient();

		const { data: files } = await supabase.storage.from('avatars').list(userId);

		if (files && files.length > 0) {
			const filePaths = files.map((file) => `${userId}/${file.name}`);
			await supabase.storage.from('avatars').remove(filePaths);
		}

		return true;
	} catch (error) {
		console.error('Delete avatar failed:', error);
		return false;
	}
}
