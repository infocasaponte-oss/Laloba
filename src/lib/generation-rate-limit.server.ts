type Bucket={tokens:number;updatedAt:number};
const buckets=new Map<string,Bucket>();
const CAPACITY=8;
const REFILL_PER_MS=CAPACITY/(60*60*1000);
const MAX_BUCKETS=10_000;

export const generationRateLimitPolicy={capacity:CAPACITY,windowMs:60*60*1000,maxBuckets:MAX_BUCKETS} as const;

function prune(now:number){
  if(buckets.size<MAX_BUCKETS)return;

  for(const [key,bucket] of buckets){
    const refilled=Math.min(CAPACITY,bucket.tokens+Math.max(0,now-bucket.updatedAt)*REFILL_PER_MS);
    if(refilled>=CAPACITY)buckets.delete(key);
    if(buckets.size<MAX_BUCKETS)break;
  }

  // Keep memory bounded even during a sustained flood of unique identities.
  while(buckets.size>=MAX_BUCKETS){
    const oldest=buckets.keys().next().value as string|undefined;
    if(!oldest)break;
    buckets.delete(oldest);
  }
}

export type RateLimitResult={allowed:true;remaining:number}|{allowed:false;retryAfterSeconds:number};

export function consumeGenerationQuota(userId:string,now=Date.now()):RateLimitResult{
  prune(now);
  const previous=buckets.get(userId)??{tokens:CAPACITY,updatedAt:now};
  const elapsed=Math.max(0,now-previous.updatedAt);
  const tokens=Math.min(CAPACITY,previous.tokens+elapsed*REFILL_PER_MS);
  if(tokens<1){
    buckets.delete(userId);
    buckets.set(userId,{tokens,updatedAt:now});
    return{allowed:false,retryAfterSeconds:Math.max(1,Math.ceil((1-tokens)/REFILL_PER_MS/1000))};
  }
  const remaining=tokens-1;
  // Reinsertion makes Map iteration approximate least-recently-used order.
  buckets.delete(userId);
  buckets.set(userId,{tokens:remaining,updatedAt:now});
  return{allowed:true,remaining:Math.floor(remaining)};
}

export function generationRateLimitSizeForTest(){return buckets.size;}
export function resetGenerationRateLimitForTest(){buckets.clear();}
