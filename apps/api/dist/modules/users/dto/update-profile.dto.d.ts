import { z } from "zod";
export declare const UpdateProfileDto: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | null | undefined;
}, {
    name?: string | undefined;
    email?: string | null | undefined;
}>;
export declare const ChangePasswordDto: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileDto>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordDto>;
//# sourceMappingURL=update-profile.dto.d.ts.map