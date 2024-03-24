
let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");
ctx.imageSmoothingEnabled= false;

let start = true;
let selection_voiture = false;
let jeu = false;
let demo = false;
let fin = false;

let vitesse = 3;
let vie = 3;
let time_collision;

let score = 0;
let time_debut = 0;
let time_fin = 0;

let demo_move = [-1, 1];
let demo_move_up = [-1, 0, 0, 0, 1];
let bouger = false;
let rand = Math.floor(Math.random() * 2)
let rand_up = Math.floor(Math.random() * 5)

let time_civil = [(Date.now() / 1000) + Math.random() * (10 - 3) + 3, (Date.now() / 1000) + Math.random() * (10 - 3) + 3, 
    (Date.now() / 1000) + Math.random() * (10 - 3) + 3, (Date.now() / 1000) + Math.random() * (10 - 3) + 3, 
    (Date.now() / 1000) + Math.random() * (10 - 3) + 3, (Date.now() / 1000) + Math.random() * (10 - 3) + 3, 
    (Date.now() / 1000) + Math.random() * (10 - 3) + 3, (Date.now() / 1000) + Math.random() * (10 - 3) + 3]; 

    let cood_route = [35, 125, 230, 325, 425, 520, 623, 715];

//let alpha = [0.8, 0.6, 0.4 ,0.2]
let alpha = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4 , 0.3, 0.2, 0.1];
let nb_alpha = 0;



//Image
let police = [];
let img_police = new Image();
img_police.src = "./assets/police/police.png";
police.push(img_police);

let backgroundStart = new Image();
backgroundStart.src = "./assets/start/fond_start.jpg";

let backgroundImg = new Image();
backgroundImg.src = "./assets/road.png";

let boutonImg = new Image();
boutonImg.src = "./assets/start/start.png";

let boutondemo = new Image();
boutondemo.src = "./assets/demo.png";

let backgroundfin = new Image();
backgroundfin.src = "./assets/GameOver/fond.jpg";

let boutonrestart = new Image();
boutonrestart.src = "./assets/GameOver/refresh.png";

let imggameover = new Image();
imggameover.src = "./assets/GameOver/gameover.png";

let pneu = new Image();
pneu.src = "./assets/pneu.png";

let all_sportive = [];
let all_civil = [];
let all_explosion = [];
let all_fumee = [];

for(let i = 1; i <= 12; i += 1)
{
    let img = new Image();
    img.src = "./assets/sportive/"+"car"+i+".png";
    all_sportive.push(img);
}

for(let i = 1; i <= 14; i += 1)
{
    let img = new Image();
    img.src = "./assets/civil/"+"civil"+i+".png";
    all_civil.push(img);
}

for(let i = 1; i <= 3; i += 1)
{
    let img = new Image();
    img.src = "./assets/explosion/"+"explosion"+i+".png";
    all_explosion.push(img);
}

for(let i = 1; i <= 5; i += 1)
{
    let img = new Image();
    img.src = "./assets/fumee/"+"fumee"+i+".png";
    all_fumee.push(img);
}

// les sons

let acceleration = new Audio("./assets/sons/acceleration.mp3");
acceleration.volume = 1.0;

let freinage = new Audio("./assets/sons/freinage.mp3");
freinage.volume = 1.0;

let accident = new Audio("./assets/sons/crash.mp3");
accident.volume = 1.0;

let circulation = new Audio("./assets/sons/circulation.mp3");
circulation.volume = 1.0;

let sirene = new Audio("./assets/sons/police.mp3");
sirene.volume = 0.9;


class Pt {
    constructor(x, y) {
        this.x = x; this.y = y;
    }
    rotate(ref, angle) {
        let dx = this.x - ref.x;
        let dy = this.y - ref.y;
        let da = (Math.PI / 180) * angle;
        this.x = ref.x + dx * Math.cos(da) + dy * Math.sin(da);
        this.y = ref.y + dy * Math.cos(da) - dx * Math.sin(da);
    }
}

function cw(a,b,c) { 
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x); 
}

function cwConstant(a, P) {
    for (let i = 0; i < P.length; i++) {
        if (i == P.length - 1) {
            if (cw(P[i], P[0], a) < 0)
            {
                return false; 
            }
        }
        else if (cw(P[i], P[i + 1], a) < 0)
        {
            return false;
        }
    }
    return true;
}

export default class Rect {
    constructor(xi, yi, xf, yf, im, taille){
    this.xi = xi; this.yi = yi;
    this.xf = xf; this.yf = yf;
    this.perso = im;
    this.taille = taille;
    this.img_id = Math.floor(Math.random() * im.length);
    this.collision = false;
    this.angleInDegrees = 0;
    this.P = [new Pt(xi, yi), new Pt(xf, yi), new Pt(xf, yf),new Pt(xi, yf)];
    this.center = new Pt(0, 0);
    
    }
    AABBcollide(otherRect) {
        if(this.xi > otherRect.xf) return false;
        if(this.xf < otherRect.xi) return false;
        if(this.yi > otherRect.yf) return false;
        if(this.yf < otherRect.yi) return false;
        return true;
    }
    afficher(){
        ctx.beginPath();
        ctx.save();  // Sauvegarde le contexte actuel
        ctx.translate((this.xi + this.xf) / 2, (this.yi + this.yf) / 2);  // Déplace le point de rotation au centre du rectangle
        ctx.rotate((this.angleInDegrees * Math.PI) / 180);  // Effectue la rotation
        ctx.drawImage(this.perso[this.img_id], -this.taille[0] / 2, -this.taille[1] / 2, this.taille[0], this.taille[1]);
        ctx.restore();  // Restaure le contexte
        for (let i = 0; i != this.P.length; i++){
            this.P[i].rotate(this.center, -this.angleInDegrees);
        }
        ctx.closePath();
    }
    move(dx, dy) {
        this.xi += dx; this.xf += dx;
        this.yi += dy; this.yf += dy;
        this.P = [new Pt(this.xi, this.yi), new Pt(this.xf, this.yi), new Pt(this.xf, this.yf), new Pt(this.xi, this.yf)];
        this.new_center();
    }
    apparait(dx, dy){
        this.xi = dx; this.xf = dx + this.taille[0];
        this.yi = dy; this.yf = dy + this.taille[1];
        this.P = [new Pt(this.xi, this.yi), new Pt(this.xf, this.yi), new Pt(this.xf, this.yf), new Pt(this.xi, this.yf)];
        this.new_center();
    }
    bord(go_right, go_up){
        if(this.xi + go_right <= 0) return false;
        if(this.yi + go_up <= 0) return false;
        if(this.xf + go_right >= cnv.width) return false;
        if(this.yf + go_up >= cnv.height) return false;
        return true;
    }
    new_center()
    {   
        this.center.x = 0;
        this.center.y = 0;
        for (let i = 0; i < this.P.length; i++) {
            this.center.x += this.P[i].x;
            this.center.y += this.P[i].y;
        }
        this.center.x /= this.P.length;
        this.center.y /= this.P.length;
    }
    test_collision(otherRect)
    {   
        for (let i = 0; i != this.P.length; i++){
            if (cwConstant(otherRect.P[i], this.P))
            {
            return true;
            }
        }
        return false;
    }
}

// Mouvement clavier

let go_up = 0;
let go_right = 0;

window.addEventListener("keydown", keydown_fun, false);
window.addEventListener("keyup", keyup_fun, false);

//vérifier si la touche est enfoncé
function keydown_fun(e)
{
    if(demo)
        return;
    
    switch(e.code) 
    {
        case "ArrowRight":
            go_right = vitesse;
            car.angleInDegrees = 10;
            police_car.angleInDegrees = 10;
            break;

        case "ArrowLeft":
            go_right = -vitesse;
            car.angleInDegrees = -10;
            police_car.angleInDegrees = -10;
            break;
        case "ArrowUp":
            go_up = -vitesse;
            acceleration.play();
//
            for(let i = 0; i != fumees.length; i++){
                if (!fumees[i].bord(0, 0)){
                    fumees[i].apparait(car.xi + 5, car.yf - 20);
                    fumees[i].img_id = 0;
                    break;
                }
            }
            for(let i = 0; i != fumees.length; i++){
                if (!fumees[i].bord(0, 0)){
                    fumees[i].apparait(car.xf - 5, car.yf - 20);
                    fumees[i].img_id = 0;
                    break;
                }
            }
            break;

        case "ArrowDown":
            go_up = vitesse;
            freinage.play();
//
            for(let i = 0; i != pneus.length; i++){
                if (!pneus[i].bord(0, 0)){
                    pneus[i].apparait(car.xi + 5, car.yf - 20);
                    break;
                }
            }
            for(let i = 0; i != pneus.length; i++){
                if (!pneus[i].bord(0, 0)){
                    pneus[i].apparait(car.xf - 5, car.yf - 20);
                    break;
                }
            }
            break;

        default:
            go_right = 0;
            go_up = 0;
            break;
    }
}

//vérifier si la touche n'est pas enfoncé
function keyup_fun(e)
{
    if(demo)
        return;
    switch (e.code)
    {
        case "ArrowRight":
        case "ArrowLeft":
            go_right = 0;
            car.angleInDegrees = 0;
            police_car.angleInDegrees = 0;
            break;

        case "ArrowUp":
        case "ArrowDown":
            go_up = 0;
            break;
    }
}

let car = new Rect(0, 0, 60, 120, all_sportive, [60,120]);
car.move(320,600);


let police_car = new Rect(0, 0, 60, 120, police, [60,120]);
police_car.img_id = 0;
police_car.move(320,750);

//
let explosion = new Rect(0, 0, 60, 120, all_explosion, [150,150]);
explosion.img_id = 0;

//..
let pneus = [];
for(let i  = 0; i < 6; i++)
{
    pneus[i] = new Rect(-50, 0, 12, 50, [pneu], [12,50]);
}

let fumees = [];
for(let i  = 0; i < 6; i++)
{
    fumees[i] = new Rect(-50, 0, 12, 50, all_fumee, [12,50]);
    fumees[i].img_id = 0;
}

let civil = [];
for(let i  = 0; i < 20; i++)
{
    civil[i] = new Rect(-200, -150, -60, 120, all_civil, [60,120]);
}

let fond_y = 0;
let fond_y2 = fond_y - cnv.height;

let minTime = 3;
let maxTime = 5;

//création du bouton start
let bouton = document.createElement("img");
bouton.src = boutonImg.src;
bouton.style.position = "absolute";
bouton.style.left =  (cnv.height/2) - 200 + "px";
bouton.style.top = (cnv.width/2) - 200 + "px";
bouton.style.width = "500px";
bouton.style.height = "500px";

cnv.parentNode.appendChild(bouton); //affiche le bouton

bouton.addEventListener("click", function () {
    if (start)
    {
        start = false;
        selection_voiture = true;
        bouton.style.display = "none";
    }
});

//création du bouton fin
let bouton_refresh = document.createElement("img");
bouton_refresh.src = boutonrestart.src;
bouton_refresh.style.position = "absolute";
bouton_refresh.style.left =  (cnv.height/2) - 130 + "px";
bouton_refresh.style.top = (cnv.width/2) + 100 + "px";
bouton_refresh.style.width = "200px";
bouton_refresh.style.height = "200px";

cnv.parentNode.appendChild(bouton_refresh); //affiche le bouton

bouton_refresh.addEventListener("click", function () {
    if (fin)
    {
        fin = false;
        start = true;
        bouton_refresh.style.display = "none";
    }
});
bouton_refresh.style.display = "none";

//création du bouton demo

let bouton_demo = document.createElement("img");
bouton_demo.src = boutondemo.src;
bouton_demo.style.position = "absolute";
bouton_demo.style.left =  cnv.height - 200 + "px";
bouton_demo.style.top = 50 + "px";
bouton_demo.style.width = "150px";
bouton_demo.style.height = "150px";

cnv.parentNode.appendChild(bouton_demo); //affiche le bouton

bouton_demo.addEventListener("click", function () {
    if (selection_voiture)
    {
        for(let j = 0; j < 12; j++)
        {
            bouton_voiture[j].style.display = "none";
        }
        time_debut = Date.now();
        selection_voiture = false;
        demo = true;
        jeu = true;
        minTime = 4;
        maxTime = 6;
        bouton_demo.style.display = "none";
    }
});
bouton_demo.style.display = "none";


//création des boutons de selection voiture
let bouton_voiture = [];
let left_b = 30;
let top_b = 250;

for(let i = 0; i < 6; i ++)
{
    bouton_voiture[i] = document.createElement("img");
    bouton_voiture[i].src = all_sportive[i].src;
    bouton_voiture[i].style.position = "absolute";
    bouton_voiture[i].style.left =  left_b + "px";
    bouton_voiture[i].style.top = top_b + "px";
    bouton_voiture[i].style.width = "100px";
    bouton_voiture[i].style.height = "200px";

    bouton_voiture[i].addEventListener("click", function ()
    {
        if (selection_voiture)
        {
            car.img_id = i;
            for(let j = 0; j < 12; j++)
            {
                bouton_voiture[j].style.display = "none";
            }
            bouton_demo.style.display = "none";
            time_debut = Date.now();
            selection_voiture = false;
            jeu = true;
        }
    });
    cnv.parentNode.appendChild(bouton_voiture[i]);
    bouton_voiture[i].style.display = "none";
    left_b += 130;
}
top_b += 250;
left_b = 30;
for(let i = 6; i < 12; i ++)
{
    bouton_voiture[i] = document.createElement("img");
    bouton_voiture[i].src = all_sportive[i].src;
    bouton_voiture[i].style.position = "absolute";
    bouton_voiture[i].style.left =  left_b + "px";
    bouton_voiture[i].style.top = top_b + "px";
    bouton_voiture[i].style.width = "100px";
    bouton_voiture[i].style.height = "200px";

    cnv.parentNode.appendChild(bouton_voiture[i]);
    bouton_voiture[i].addEventListener("click", function ()
    {
        if (selection_voiture)
        {
            car.img_id = i;
            for(let j = 0; j < 12; j++)
            {
                bouton_voiture[j].style.display = "none";
            }
            bouton_demo.style.display = "none";
            time_debut = Date.now();
            selection_voiture = false;
            jeu = true;
        }
    });
    bouton_voiture[i].style.display = "none";
    left_b += 130;
}

function update()
{
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    if(start)
    {
        ctx.drawImage(backgroundStart, 0, 0, cnv.width, cnv.height);
        bouton.style.display = "block";
        time_debut = 0;
        time_fin = 0;
        score = 0;
    }

    if(selection_voiture)
    {
        ctx.drawImage(backgroundStart, 0, 0, cnv.width, cnv.height);
        for(let i = 0; i < 12; i++)
        {
            bouton_voiture[i].style.display = "block";
        }

        bouton_demo.style.display = "block";

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText("Choisissez une voiture !",  20 , 150 );

        minTime = 3;
        maxTime = 5;
        vitesse = 3;

    }

    if(jeu)
    {
        circulation.play();
        ctx.drawImage(backgroundImg, 0, fond_y, cnv.width, cnv.height);
        ctx.drawImage(backgroundImg, 0, fond_y2, cnv.width, cnv.height);
        fond_y += vitesse*1.5;
        fond_y2 += vitesse*1.5;

        if (fond_y > cnv.height)
            fond_y = -cnv.height;

        if (fond_y2 > cnv.height)
            fond_y2 = -cnv.height;

        if (demo)
        {
            car.move(0, -200);
        
            for (let i = 0; i != civil.length; i++){
                if (car.test_collision(civil[i])){
                    bouger = true;
                }
            }
            car.move(0, 200);

            car.move(0, -100);
            
            for (let i = 0; i != civil.length; i++){
                if (car.test_collision(civil[i])){
                    bouger = true;
                }
            }
            car.move(0, 100);

            if (bouger){
                car.move(demo_move[rand]*vitesse, demo_move_up[rand_up]*vitesse);
                police_car.move(demo_move[rand]*vitesse, demo_move_up[rand_up]*vitesse);
                if(demo_move_up[rand_up]*vitesse > 0)
                {
                    freinage.play();
                    for(let i = 0; i != pneus.length; i++){
                        if (!pneus[i].bord(0, 0)){
                            pneus[i].apparait(car.xi + 5, car.yf - 20);
                            break;
                        }
                    }
                    for(let i = 0; i != pneus.length; i++){
                        if (!pneus[i].bord(0, 0)){
                            pneus[i].apparait(car.xf - 5, car.yf - 20);
                            break;
                        }
                    }
                }

                if(demo_move_up[rand_up]*vitesse < 0)
                {
                    acceleration.play();
                    for(let i = 0; i != fumees.length; i++){
                        if (!fumees[i].bord(0, 0)){
                            fumees[i].apparait(car.xi + 5, car.yf - 20);
                            fumees[i].img_id = 0;
                            break;
                        }
                    }
                    for(let i = 0; i != fumees.length; i++){
                        if (!fumees[i].bord(0, 0)){
                            fumees[i].apparait(car.xf - 5, car.yf - 20);
                            fumees[i].img_id = 0;
                            break;
                        }
                    }
                }

                if(demo_move[rand] < 0)
                {
                    car.angleInDegrees = -10;
                    police_car.angleInDegrees = -10;
                }
                else if(demo_move[rand] > 0)
                {
                    car.angleInDegrees = 10;
                    police_car.angleInDegrees = 10;
                }
                else
                {
                    car.angleInDegrees = 0;
                    police_car.angleInDegrees = 0;
                }
                car.afficher();
                for (let i = 0; i != civil.length; i++){
                    if (car.test_collision(civil[i])){
                        car.move(-demo_move[rand]*vitesse, -go_up);
                        police_car.move(-demo_move[rand]*vitesse, -go_up);
                        car.afficher();
                    }
                }
                if (!car.bord(demo_move[rand]*vitesse, demo_move_up[rand_up]*vitesse)){
                    
                    car.move(-demo_move[rand]*vitesse, -demo_move_up[rand_up]*vitesse);
                    police_car.move(-demo_move[rand]*vitesse, -demo_move_up[rand_up]*vitesse);
                }
            }
            
            else {
                car.angleInDegrees = 0;
                police_car.angleInDegrees = 0;
                bouger = false;
                rand = Math.floor(Math.random() * 2);
                rand_up = Math.floor(Math.random() * 5);
            }
            bouger = false;
        }
        else
        {
            car.move(go_right, go_up);
            police_car.move(go_right, go_up);

            if (!car.bord(go_right, go_up))
            {
                car.move(-go_right, -go_up);
                if(vie == 1)
                    police_car.move(-go_right, -go_up);
            }
        }

        if (car.collision){
            ctx.globalAlpha = alpha[nb_alpha % alpha.length];
            nb_alpha++;
        }
        
        car.afficher();

        if(vie == 1 )
        {
            ctx.globalAlpha = 1.0;
            police_car.afficher();
            sirene.play();
        }

        for (let i = 0; i != civil.length; i++){
            ctx.globalAlpha = 1.0;
            civil[i].move(0, vitesse);
            civil[i].afficher();
        }
        for (let i = 0; i != pneus.length; i++){
            ctx.globalAlpha = 1.0;
            pneus[i].move(0, vitesse*1.5);
            pneus[i].afficher();
        }

        for (let i = 0; i != fumees.length; i++){
            ctx.globalAlpha = 1.0;
            if(Math.floor(Math.random() * 10) == 0)
                fumees[i].img_id++;
            if (fumees[i].img_id < all_fumee.length){
                fumees[i].afficher();
            }
            
            fumees[i].move(0, vitesse*1.5);
            
        }
        
        if (car.collision && Date.now()/1000 - time_collision/1000 > 3){
            car.collision = false;
            ctx.globalAlpha = 1.0;
        }

        if (car.collision && Date.now()/1000 - time_collision/1000 < 1)
        {
            ctx.globalAlpha = 1.0;
            explosion.apparait(car.xi-50, car.yi-50);

            if (explosion.img_id < all_explosion.length){
                explosion.afficher();
            }
            
            if(Math.floor(Math.random() * 10) == 0){
                explosion.img_id++;
            }
        }
        else 
        {
            explosion.apparait(1000, 1000);
            explosion.img_id = 0;
        }

        for (let i = 0; i != civil.length; i++){
            ctx.globalAlpha = 1.0;
            civil[i].afficher();
            civil[i].move(0, vitesse); 
            if ((car.test_collision(civil[i]) || civil[i].test_collision(car)) && !car.collision){
                accident.play();
                vie -= 1;
                car.collision = true;
                time_collision = Date.now();
                nb_alpha = 0;
            }
        }

        for (let j = 0; j != time_civil.length; j++){
            if (time_civil[j] <= Date.now() / 1000){
                for (let i = 0; i != civil.length; i++){
                    if (!civil[i].bord(0, 0)){
                        civil[i].apparait(cood_route[j], 0);
                        civil[i].angleInDegrees = 180;
                        break;
                    }
                }
                time_civil[j] = (Date.now() / 1000) + Math.random() * (maxTime - minTime) + minTime;
            }
        }
        
        if (vie == 0){
            circulation.pause();
            sirene.pause();
            time_fin = Date.now();
            score = (time_fin - time_debut) / 1000; //seconde
            jeu = false;
            demo = false;
            fin = true;
        }
    }

    if(fin)
    {
        bouton.style.display = "none";
        ctx.drawImage(backgroundfin, 0, 0, cnv.width, cnv.height);
        ctx.drawImage(imggameover, 183, -20, cnv.width/2-20, cnv.height/2);
        bouton_refresh.style.display = "block";

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText("Votre score : " + score.toFixed(2) + " secondes", cnv.width / 2 -300 , cnv.height / 2+30 );

        fond_y = 0;
        fond_y2 = fond_y - cnv.height;

        vie = 3;

        car.apparait(320,600)
        police_car.apparait(320,740);

        for (let i = 0; i != civil.length; i++){
            civil[i].apparait(1000,1000);
        }

    }
}

setInterval(function() 
{
    if (jeu)
    {
        vitesse += 1;
        if(minTime > 1)
        {
            minTime -= 1;
        }
        if(maxTime > 2)
        {
            maxTime -= 1;
        }

    }
}, 20000);

setInterval(update, 20);