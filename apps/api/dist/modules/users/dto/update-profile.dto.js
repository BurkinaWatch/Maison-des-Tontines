import { z } from "zod";
export const UpdateProfileDto = z.object({
    name: z.string().min(2).max(255).optional(),
    email: z.string().email().optional().nullable(),
});
export const ChangePasswordDto = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
});
//# sourceMappingURL=update-profile.dto.js.map