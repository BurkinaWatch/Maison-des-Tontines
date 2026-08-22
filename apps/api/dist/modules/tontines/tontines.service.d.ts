import { TontineEngine } from "./tontine-engine/engine.service.js";
export declare class TontinesService {
    private engine;
    constructor(engine: TontineEngine);
    createTontine(data: any, userId: string): Promise<any>;
    getTontines(userId: string, filters: any): Promise<any>;
    getTontineById(id: string, userId: string): Promise<any>;
    updateTontine(id: string, data: any): Promise<any>;
    addMember(tontineId: string, userId: string, role?: string): Promise<any>;
}
export declare const tontinesService: TontinesService;
//# sourceMappingURL=tontines.service.d.ts.map