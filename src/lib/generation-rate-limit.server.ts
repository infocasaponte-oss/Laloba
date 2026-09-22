type Bucket={tokens:number;updatedAt:number};
const buckets=new Map<string,Bucket>();
const CAPACITY=8;
const REFILL_PER_MS=CAPACITY/(60*60*1000);
const MAX_BUCKETS=10_000;

function prune(now:number){
  if(buckets.size<MAX_BUCKETS)return;
  for(const [key,bucket] of buckets){
    const refilled=Math.min(CAPACITY,bucket.tokens+(now-bucket.updatedAt)*REFILL_PER_MS);
    if(refilled>=CAPACITY)buckets.delete(key);
    if(buckets.size<MAX_BUCKETS/2)break;
  }
}

export type RateLimitResult={allowed:true;remaining:number}|{allowed:false;retryAfterSeconds:number};

export function consumeGenerationQuota(userId:string,now=Date.now()):RateLimitResult{
  prune(now);
  const previous=buckets.get(userId)??{tokens:CAPACITY,updatedAt:now};
  const tokens=Math.min(CAPACITY,previous.tokens+(now-previous.updatedAt)*REFILL_PER_MS);
  if(tokens<1){
    buckets.set(userId,{tokens,updatedAt:now});
    return{allowed:false,retryAfterSeconds:Math.max(1,Math.ceil((1-tokens)/REFILL_PER_MS/1000))};
  }
  const remaining=tokens-1;
  buckets.set(userId,{tokens:remaining,updatedAt:now});
  return{allowed:true,remaining:Math.floor(remaining)};
}
