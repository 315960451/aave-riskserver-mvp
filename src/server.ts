import {AaveService, CONFIG} from './aave-request';
import { RiskAnalyzer } from './risk';
import express from "express";
import cors from "cors";

const app= express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// === 核心 API 路由 ===
// 访问方式: GET /api/risk?address=0x...
app.get("/api/risk",async(req,res)=>{
    try{
        const userAddress = req.query.address as string;
        if(!userAddress){
            res.status(400).json({error:"请提供address参数"});
            return;
        }
        console.log(`API是查询请求${userAddress}`);
        const aaveservice=new AaveService(CONFIG.RPC_URL,CONFIG.Address.PoolAddressProvider);
        console.log("🚀 开始获取客户数据");
        const userRawData=await aaveservice.getUserRawData(userAddress);

        console.log("🚀 开始分析客户数据");

    //注意，这里排除掉null的情况，否则下一句编译报错。
        if (!userRawData) {
            console.log("[service]未能找到数据或用户无资产")
        return;
        };

        const userRiskProfile= RiskAnalyzer.analyze(userRawData);
        res.json(userRiskProfile);
    }
        catch(error:any){
            console.error("API error",error);
            res.status(500).json({error:"服务器内部错误",details:error.message});
        };
});


const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`服务器已经启动：http://localhost:${PORT}`);
    console.log("// 访问方式: /api/risk?address=0x...")
});