import {AaveService, CONFIG} from './aave-request'
import { RiskAnalyzer } from './risk'

async function main() {
    // 1. 实例化 AaveService
    const aaveservice=new AaveService(CONFIG.RPC_URL,CONFIG.Address.PoolAddressProvider);
    // 2. 定义要查询的目标用户地址
    const userAddress="0xA16A99f3D792863a1054925661e11ace876633f6";

    console.log("🚀 开始获取客户数据");

    // 3. 调用服务获取报告
    const userRawData=await aaveservice.getUserRawData(userAddress);

    console.log("🚀 开始分析客户数据");

    //注意，这里排除掉null的情况，否则下一句编译报错。
    if (!userRawData) {
        console.log("[service]未能找到数据或用户无资产")
        return;
    };

    const userRiskProfile= RiskAnalyzer.analyze(userRawData);
    // 4. 打印结果 (建议使用 console.table)
    if (userRiskProfile) {console.table(userRiskProfile)}
    else { console.log("fail");}
    //    如果有数据 -> 打印表格
    //    如果没有 -> 打印失败提示
}

// 执行主函数
main();