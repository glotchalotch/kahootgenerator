const fs = require('fs');
const os = require('os');
const AdmZip = require('adm-zip');
const {dialog} = require('electron').remote;
const del = require('del');

document.getElementById('writebutton').onclick = newQ;
document.getElementById('finishbutton').onclick = beginComplete;
document.getElementById('rbutton').onclick = delQ;

let questionNum = 1;

function newQ() {
    let inputDiv = document.getElementById("inputs");
    let height = getComputedStyle(inputDiv).height;
    let newHeight = parseInt(height) + 25;
    let newHeightStr = newHeight + "px";
    inputDiv.style.setProperty("height", newHeightStr);
    questionNum++;
    for(i = 0; i < 7; i++) {
        let box = document.createElement("input");
        box.style.setProperty("position", "absolute");
        box.style.setProperty("top", `${newHeight - 90}px`);
        switch (i) {
            case 0: { box.className = "question"; box.id = questionNum + "question"; break; }
            case 1: { box.className = "length"; box.id = questionNum + "length"; break; }
            case 2: { box.className = "a1"; box.id = questionNum + "a1"; break; }
            case 3: { box.className = "a2"; box.id = questionNum + "a2"; break; }
            case 4: { box.className = "a3"; box.id = questionNum + "a3"; break; }
            case 5: { box.className = "a4"; box.id = questionNum + "a4"; break; }
            case 6: { box.className = "ca"; box.id = questionNum + "ca"; break; }
        }
        inputDiv.appendChild(box);
    }
    
}

function delQ() {
    if(questionNum > 1) {
        let inputDiv = document.getElementById("inputs");
        let height = getComputedStyle(inputDiv).height;
        let newHeight = parseInt(height) - 25;
        let newHeightStr = newHeight + "px";
        inputDiv.style.setProperty("height", newHeightStr);
        for(i = 0; i < 7; i++) {
            let str;
            switch (i) {
                case 0: { str = "question"; break; }
                case 1: { str = "length"; break; }
                case 2: { str = "a1"; break; }
                case 3: { str = "a2"; break; }
                case 4: { str = "a3"; break; }
                case 5: { str = "a4"; break; }
                case 6: { str = "ca"; break; }
            }
            inputDiv.removeChild(document.getElementById(`${questionNum}${str}`));
        }
        questionNum--;
    }
}

const dirname = `${os.tmpdir() + require('path').sep + "khgTemp"}`;
async function beginComplete() {
    if(fs.existsSync(dirname)) await del(dirname, {force:true});
    fs.mkdirSync(dirname);
    fs.mkdirSync(`${dirname}/data/kahoot/functions/questions`, {recursive: true});
    fs.mkdirSync(`${dirname}/data/minecraft/tags/functions`, {recursive: true});
    makeMcmeta();
    makePremades();
    makeQuestions();
    makeEnds();
    makePres();
    makeAnsTest();
    zipUp();
}

function makeMcmeta() {
    fs.writeFileSync(`${dirname}/pack.mcmeta`, "\{\n\"pack\":\{\n\"pack_format\": 4,\n\"description\": \"puts kahoot in minecraft\"\n\}\n\}");
}

function makePremades() {
    fs.writeFileSync(`${dirname}/data/minecraft/tags/functions/tick.json`, "\{\n\"values\": \[\n\"kahoot:answertest\"\n\]\n\}");
    fs.writeFileSync(`${dirname}/data/minecraft/tags/functions/load.json`, "\{\n\"values\": \[\n\"kahoot:init\"\n\]\n\}");
    fs.writeFileSync(`${dirname}/data/kahoot/functions/begin.mcfunction`, "title @a times 10 70 20\ntitle @a title \"Kahoot!\"\ntitle @a subtitle \"Begins in 10 seconds, get ready!\"\ntitle @a actionbar \"Created by glotch\"\nschedule function kahoot:questions/q1 200");
    fs.writeFileSync(`${dirname}/data/kahoot/functions/endgame.mcfunction`, "title @a title \"Thanks for playing!\"\ntitle @a subtitle \"Do /reload to clear scoreboard\"\ntitle @a actionbar \"Created by glotch\"");
    fs.writeFileSync(`${dirname}/data/kahoot/functions/init.mcfunction`, "scoreboard objectives add answer trigger\nscoreboard objectives add answerTick dummy\nscoreboard objectives add correctAnswer dummy\nscoreboard objectives add titleShown dummy\nscoreboard objectives add scoreToAdd dummy\nscoreboard objectives add mathDummy dummy\nscoreboard objectives add totalScore dummy\nscoreboard objectives add questionLength dummy\nscoreboard objectives add gameActive dummy\nscoreboard objectives add timeLeft dummy\nscoreboard objectives add mathDummy2 dummy\nscoreboard objectives add currentQuestion dummy\nscoreboard players set @a answer 0\nscoreboard players set @a answerTick 0\nscoreboard players set @a titleShown 0\nscoreboard players set @a totalScore 0\nscoreboard players set @a scoreToAdd 0\nscoreboard players set @a questionLength 0\nscoreboard players set @a gameActive 0\nscoreboard players set @a currentQuestion 0\ntag @a remove answered\nscoreboard objectives modify timeLeft displayname \"Time Left\"\nscoreboard objectives modify totalScore displayname \"Leaderboard\"\nscoreboard objectives setdisplay sidebar");
    fs.writeFileSync(`${dirname}/data/kahoot/functions/playsounds.mcfunction`, "stopsound @a music\nscoreboard players set @a mathDummy 400\nexecute at @a if score @r questionLength <= @r mathDummy run playsound kahoot:kahoot.ingame.20 music @a\nscoreboard players set @a mathDummy2 600\nexecute at @a if score @r questionLength > @r mathDummy if score @r questionLength <= @r mathDummy2 run playsound kahoot:kahoot.ingame.30 music @a\nscoreboard players set @a mathDummy 1200\nexecute at @a if score @r questionLength > @r mathDummy2 if score @r questionLength <= @r mathDummy run playsound kahoot:kahoot.ingame.60 music @a\nscoreboard players set @a mathDummy2 1800\nexecute at @a if score @r questionLength > @r mathDummy if score @r questionLength <= @r mathDummy2 run playsound kahoot:kahoot.ingame.90 music @a\nexecute at @a if score @r questionLength > @r mathDummy2 run playsound kahoot:kahoot.ingame.120 music @a");
    fs.writeFileSync(`${dirname}/data/kahoot/functions/questions/qendg.mcfunction`, "tag @a remove answered\ntitle @a clear\ntitle @a times 10 70 20\nstopsound @a music\nexecute at @a run playsound kahoot:kahoot.end music @a\nscoreboard players set @a gameActive 0\nscoreboard players operation @a mathDummy = @a questionLength\nexecute as @a if score @s answerTick > @s questionLength run scoreboard players operation @s answerTick = @s questionLength\nexecute as @a if score @s answer = @s correctAnswer run scoreboard players operation @s mathDummy -= @s answerTick\nexecute as @a if score @s answer = @s correctAnswer run scoreboard players operation @s scoreToAdd = @s mathDummy\nexecute as @a if score @s answer = @s correctAnswer run scoreboard players operation @s totalScore += @s scoreToAdd\nexecute as @a if score @s answer matches 0 run title @s title [\"\",{\"text\":\"Time up\",\"color\":\"red\"}]\nexecute as @a if score @s answer = @s correctAnswer run title @s title [\"\",{\"text\":\"Correct\",\"color\":\"green\"}]\nexecute as @a unless score @s answer = @s correctAnswer unless score @s answer matches 0 run title @s title [\"\",{\"text\":\"Wrong\",\"color\":\"red\"}]\nexecute as @a run title @s subtitle [\"Your score is \",{\"score\":{\"name\":\"@s\",\"objective\":\"totalScore\"}}]\nscoreboard players set @a answer 0\nscoreboard players set @a titleShown 0\nscoreboard objectives setdisplay sidebar totalScore");
}

function makeQuestions() {
    for(i = 1; i < (questionNum + 1); i++) {
        fs.writeFileSync(`${dirname}/data/kahoot/functions/questions/q${i}.mcfunction`, `scoreboard players set @a gameActive 1\nscoreboard players set @a currentQuestion ${i}\nscoreboard players enable @a answer\nscoreboard players set @a answer 0\nscoreboard players set @a answerTick 0\nscoreboard players set @a correctAnswer ${document.getElementById(`${i}ca`).value}\nscoreboard players set @a questionLength ${parseInt(document.getElementById(`${i}length`).value)*20}\nscoreboard objectives setdisplay sidebar timeLeft\nfunction kahoot:playsounds\ntellraw @a ["------------\\n",{"text":"${document.getElementById(`${i}question`).value}\\n"},{"text":"${document.getElementById(`${i}a1`).value}\\n","color":"red","bold":true,"clickEvent":{"action":"run_command","value":"/trigger answer set 1"}},{"text":"${document.getElementById(`${i}a2`).value}\\n","color":"blue","bold":true,"clickEvent":{"action":"run_command","value":"/trigger answer set 2"}},{"text":"${document.getElementById(`${i}a3`).value}\\n","color":"yellow","bold":true,"clickEvent":{"action":"run_command","value":"/trigger answer set 3"}},{"text":"${document.getElementById(`${i}a4`).value}\\n","color":"green","bold":true,"clickEvent":{"action":"run_command","value":"/trigger answer set 4"}}, "------------"]`);
    }
}

function makeEnds() {
    let funcStr;
    for(i = 1; i < questionNum + 1; i++) {
        i < questionNum ? funcStr = `questions/q${i+1}pre` : funcStr = "endgame";
        fs.writeFileSync(`${dirname}/data/kahoot/functions/questions/q${i}end.mcfunction`, `function kahoot:questions/qendg\nschedule function kahoot:${funcStr} 100`);
    }
}

function makePres() {
    for(i = 2; i < questionNum + 1; i++) {
        fs.writeFileSync(`${dirname}/data/kahoot/functions/questions/q${i}pre.mcfunction`, `title @a times 10 70 20\ntitle @a title "Question ${i}"\ntitle @a subtitle "Begins in 10 seconds"\nschedule function kahoot:questions/q${i} 200`);
    }
}

function makeAnsTest() {
    let startStr = "execute as @a[tag=!answered] if score @s gameActive matches 1 if score @s answer matches 0 run scoreboard players add @s answerTick 1\nexecute as @a[tag=!answered] if score @s gameActive matches 1 if score @s answerTick > @s questionLength run tag @s add answered\nexecute as @a[tag=!answered] if score @s gameActive matches 1 unless score @s answer matches 0 run tag @s add answered\nexecute as @a[tag=answered] if score @s gameActive matches 1 if score @s titleShown matches 0 run title @a times 10 70 20\nexecute as @a[tag=answered] if score @s gameActive matches 1 if score @s titleShown matches 0 run title @s title \"Were you tooo fast?\"\nexecute as @a[tag=answered] if score @s gameActive matches 1 run scoreboard players set @s titleShown 1\nscoreboard players operation Seconds mathDummy = @r answerTick\nscoreboard players operation Seconds mathDummy2 = @r questionLength\nscoreboard players operation Seconds mathDummy2 -= Seconds mathDummy\nscoreboard players set Seconds mathDummy 20\nscoreboard players operation Seconds mathDummy2 /= Seconds mathDummy\nscoreboard players operation Seconds timeLeft = Seconds mathDummy2"
    for(i = 1; i < questionNum + 1; i++) {
        startStr += `\nexecute unless entity @a[tag=!answered] if score @r currentQuestion matches ${i} run function kahoot:questions/q${i}end`
    }
    fs.writeFileSync(`${dirname}/data/kahoot/functions/answertest.mcfunction`, `${startStr}`);
}

async function zipUp() {
    let dialogReturn = await dialog.showSaveDialog({filters: [{name: "Zip File", "extensions": ["zip"]}]});
    if(dialogReturn.filePath) {
        let zip = new AdmZip();
        zip.addLocalFolder(dirname);
        zip.writeZip(dialogReturn.filePath, (err) => {
            if(err) throw err;
            else {
                let p = document.createElement('p');
                p.innerHTML = "Save successful!";
                p.style.color = "green";
                p.style.position = "absolute";
                p.style.bottom = "-15px";
                p.style.left = "340px";
                document.getElementById('inputs').appendChild(p) 
            } 
        });
    }
}