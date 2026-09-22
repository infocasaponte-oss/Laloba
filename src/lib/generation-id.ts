const GENERATION_ID=/^[A-Za-z0-9][A-Za-z0-9_-]{7,79}$/;

export function isValidGenerationId(value:string){
 return GENERATION_ID.test(value);
}

export function assertGenerationId(value:string){
 if(!isValidGenerationId(value))throw new Error("Invalid generation id");
 return value;
}

export function createGenerationId(){
 if(typeof crypto!=="undefined"&&"randomUUID" in crypto)return assertGenerationId(`gen_${crypto.randomUUID().replaceAll("-","")}`);
 throw new Error("Secure random generation IDs are unavailable");
}
