export interface DashboardStats {
    totalProducts: number;
    totalStock: number;
    recentEntries: number;
    recentExits: number;
    outOfStockCount: number;
    lowStockCount: number;
    movementTrend: { date: string; entries: number; exits: number }[];
    movementTypeDistribution: { type: string; count: number }[];
}
