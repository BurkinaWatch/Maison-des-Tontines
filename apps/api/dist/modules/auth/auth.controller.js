export class AuthController {
    async requestOtp(req, res, next) {
        try {
            const { phone } = req.body;
            const result = await authService.requestOtp(phone);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { phone, otp } = req.body;
            const result = await authService.verifyOtp({ phone, otp });
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async register(req, res, next) {
        try {
            const data = req.body;
            const result = await authService.register(data);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const data = req.body;
            const result = await authService.login(data);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const userId = req.userId;
            const { refreshToken } = req.body;
            const result = await authService.logout(userId, refreshToken || "");
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async logoutAll(req, res, next) {
        try {
            const userId = req.userId;
            const result = await authService.logoutAll(userId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=auth.controller.js.map