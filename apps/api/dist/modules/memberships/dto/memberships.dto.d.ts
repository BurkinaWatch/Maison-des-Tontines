import { z } from "zod";
export declare const InviteMemberDto: z.ZodObject<{
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
}, {
    phone: string;
}>;
export type InviteMemberInput = z.infer<typeof InviteMemberDto>;
//# sourceMappingURL=memberships.dto.d.ts.map