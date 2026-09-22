const PROJECT_ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function isValidProjectId(value:string){
 return PROJECT_ID.test(value);
}

export function assertProjectId(value:string){
 if(!isValidProjectId(value))throw new Error("Invalid project id");
 return value;
}
