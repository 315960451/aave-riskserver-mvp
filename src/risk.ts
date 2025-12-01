import {AaveAccountDataRaw} from './aave-request'
import {formatUnits} from "ethers"


export interface FormattedUserData{
    totalCollateralUSD:string,
    totalDebtUSD:string,
    healthFactor:string,
    riskStatus:"safe"|"risk"|"liquidation"
}

//静态方法：纯函数，输入Raw数据，输出风控报告
export class RiskAnalyzer{
    public static analyze(data: AaveAccountDataRaw): FormattedUserData {
        // 1. 转换 Collateral 和 Debt (注意：USD 是 8 位精度)
        const totalCollateralUSD=Number(formatUnits(data.totalCollateralBase.toString(),8)).toFixed(2);
        const totalDebtUSD=Number(formatUnits(data.totalDebtBase.toString(),8)).toFixed(2);
        // 2. 处理 Health Factor (注意：18 位精度，且要处理无穷大的情况)
        let status:"safe"|"risk"|"liquidation"="safe";
        const hfNum=Number(formatUnits(data.healthFactor.toString(),18));
        //    提示：用三元运算符处理 > 100 的情况
        console.log(hfNum)
        const displayHF=hfNum>100?"Max":hfNum.toFixed(2);
        // 3. 判断风险等级 (Safe / Risk / Liquidation)
        if (hfNum<1) status="liquidation";
        else if (hfNum<1.5) status="risk";
        // 4. 返回组装好的对象
        return {totalCollateralUSD:totalCollateralUSD,
                totalDebtUSD:totalDebtUSD,
                healthFactor:displayHF,
                riskStatus:status
        }; 
    };
};