import { z } from "zod";
export const InviteMemberDto = z.object({
    phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
});
//# sourceMappingURL=memberships.dto.js.map