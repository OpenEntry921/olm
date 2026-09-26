import {randomBytes,scryptSync} from "node:crypto";

if(!process.stdin.isTTY){console.error("보안을 위해 대화형 터미널에서 실행해 주세요.");process.exit(1)}
process.stdout.write("관리자 비밀번호: ");
process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding("utf8");
let password="";
process.stdin.on("data",character=>{
  if(character==="\u0003"){process.stdin.setRawMode(false);process.exit(130)}
  if(character==="\r"||character==="\n"){
    process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write("\n");
    if(password.length<12){console.error("비밀번호는 12자 이상이어야 합니다.");process.exitCode=1;return}
    const salt=randomBytes(24).toString("hex"),hash=scryptSync(password,salt,32).toString("hex");password="";
    console.log(`ADMIN_PASSWORD_SALT=${salt}`);console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    return;
  }
  if(character==="\u007f"){password=password.slice(0,-1);return}
  if(character>=" ")password+=character;
});
