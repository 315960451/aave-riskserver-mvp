import { JsonRpcProvider, Contract, formatUnits } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const envRpcUrl=process.env.ALCHEMY_RPC_URL;
if (!envRpcUrl) {
    // 如果没读到，直接在这里炸掉，报错信息非常清晰
    throw new Error("❌ 致命错误: 未找到 ALCHEMY_RPC_URL，请检查 .env 文件");
}
// ==========================================
// 1. 配置区 (Configuration)
// TODO: 把硬编码的 URL、地址、ABI 放在这里
export const CONFIG = {
    // 1. RPC 节点 URL
    RPC_URL:envRpcUrl,
    // 2. 核心合约地址 (PoolAddressesProvider)，如有需要其它地址可以添加
    Address:{
        PoolAddressProvider:"0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
    },
    // 3. ABIs (只需要我们用到的函数定义)，如有需要其它地址可以添加
    ABIS:{
        getPool:["function getPool() external view returns (address)"],
        getUserAccountData:["function getUserAccountData(address user) external view  returns (uint256 totalCollateralBase,uint256 totalDebtBase,uint256 availableBorrowsBase,uint256 currentLiquidationThreshold,uint256 ltv,uint256 healthFactor)"],
    },
};


// 2. 类型定义 (Interfaces)

// 2.1: 对应 Aave 合约返回的原始数据 (全是 bigint)
export interface AaveAccountDataRaw {
    totalCollateralBase:BigInt,
    totalDebtBase:BigInt,
    //mvp只取3个重要的数据
    //availableBorrowsBase:BigInt,
    //currentLiquidationThreshold:BigInt,
    //ltv:BigInt,
    healthFactor:BigInt
}



// ==========================================
// 3. 服务类 (Service Class)
// TODO: 封装核心逻辑
// ==========================================
export class AaveService {
    // 定义成员变量: provider 和 contract
    private provider:JsonRpcProvider;
    private addressProviderContract:Contract;
    constructor(rpcUrl: string, addressProviderAddress: string) {
        // TODO: 初始化 Provider
        this.provider=new JsonRpcProvider(rpcUrl);
        // TODO: 初始化 AddressProvider 合约
        this.addressProviderContract=new Contract(CONFIG.Address.PoolAddressProvider,CONFIG.ABIS.getPool,this.provider);
    }

    /**
     * 内部工具：获取 Pool 地址
     * 提示：这是一个异步操作，且只在类内部使用
     */
    private async getPoolAddress(): Promise<string> {
        // TODO: 调用合约方法获取 pool 地址并返回
        const poolAddress= await this.addressProviderContract.getPool();
        return poolAddress; // 占位符
    }


    public async getUserRawData(userAddress: string):Promise<AaveAccountDataRaw|null>{
        try{
           const poolAddress = await this.getPoolAddress();
           const poolContract = new Contract(poolAddress,CONFIG.ABIS.getUserAccountData,this.provider);
           const userRawData=await poolContract.getUserAccountData(userAddress);
           if (userRawData.totalCollateralBase===BigInt(0)&&userRawData.totalDebtBase===BigInt(0)){
                console.log(`地址${userAddress}没有资产和负债余额`);
                return null;
        } else{
            return userRawData;
        }

        }catch(error:any){
            console.log(error);
            return null;
        }
    }}
  