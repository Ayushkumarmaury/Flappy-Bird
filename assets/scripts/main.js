class Game {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.baseHeight = 720;
        this.ratio = this.height / this.baseHeight;
        this.background = new Background(this);
        this.player = new Player(this);
        this.sound = new AudioControl();
        this.obstacles = [];
        this.numberofObstacles = 6;
        this.gravity;
        this.speed;
        this.minSpeed;
        this.maxSpeed;
        this.score;
        this.gameOver;
        this.bottomMargin;
        this.timer;
        this.smallFont;
        this.largeFont;
        this.message1;
        this.message2;
        this.eventTimer = 0;
        this.eventInterval = 150;
        this.eventUpdate = false;
        this.touchStartX;
        this.swapDistance=50;


        this.resize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', e => {
            this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
        });
        //mouse controls
        this.canvas.addEventListener('mousemove', e => {
            this.player.flap();
            
        });

        this.canvas.addEventListener('mouseup', e => {
            setTimeout(()=>{
                this.player.windsUp();
            },30)
        });
        //keyboard controls
        window.addEventListener('keydown', e => {
            if (e.key === ' ' || e.key === 'Enter') {
                this.player.flap();
            }
            if (e.key === 'Shift' || e.key.toLowerCase() === 'c') { this.player.startCharge(); }
        });

        window.addEventListener('keyup', e => {
            this.player.windsUp();
        });

        //touch controls
        this.canvas.addEventListener('touchstart', e => {
           
            this.touchStartX = e.changedTouches[0].pageX;
        });
        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
        });

        this.canvas.addEventListener('touchend', e => {
            if(e.changedTouches[0].pageX - this.touchStartX > this.swapDistance) {
                this.player.startCharge();
            }else{
                this.player.flap();
                // setTimeout(()=>{
                //     this.player.windsUp();
                // },30)
            }
        });
        
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        // this.ctx.fillStyle = 'blue';
        this.ctx.textAlign = "right";
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'white';
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ratio = this.height / this.baseHeight;

        this.bottomMargin=Math.floor(50*this.ratio);
        this.smallFont=Math.floor(20*this.ratio);
        this.largeFont=Math.floor(37*this.ratio);
        this.ctx.font = this.smallFont + 'px impact';
        this.gravity = 0.15 * this.ratio;
        this.speed = 4 * this.ratio;
        this.minSpeed = this.speed;
        this.maxSpeed = this.speed * 4;
        this.background.resize();
        this.player.resize();
        this.createObstacles();
        this.obstacles.forEach(obstacle => {
            obstacle.resize();
        })
        this.score = 0;
        this.gameOver = false;
        this.timer = 0;
    };
    render(deltaTime) {
        if (!this.gameOver) this.timer += deltaTime;
        this.handlePeriodicEvents(deltaTime);
        this.background.update();
        this.background.draw();
        this.drawStatusText();
        this.player.update();
        this.player.draw();
        this.obstacles.forEach(obstacle => {
            obstacle.update();
            obstacle.draw();
        })
    }
    createObstacles() {
        this.obstacles = [];
        const firstX = this.baseHeight * this.ratio;
        const obstacleSpacing = 600 * this.ratio;
        for (let i = 0; i < this.numberofObstacles; i++) {
            this.obstacles.push(new Obstacle(this, firstX + i * obstacleSpacing))
        }
    }
    checkCollision(a, b) {
        const dx = a.collisionX - b.collisionX;
        const dy = a.collisionY - b.collisionY;
        const distance = Math.hypot(dx, dy);
        const sumOfRadii = a.collisionRadius + b.collisionRadius;
        return distance <= sumOfRadii;
    }
    formatTimer() {
        return (this.timer * 0.001).toFixed(1);
    }

    handlePeriodicEvents(deltaTime) {
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime;
            this.eventUpdate = false;
        } else {
            this.eventTimer = this.eventTimer % this.eventInterval;
            this.eventUpdate = true;

        }
    }
    triggerGameOver(){
        if(!this.gameOver){
            this.gameOver = true;
            if(this.obstacles.length<=0){
                this.sound.play(this.sound.win);
                this.message1 = 'Nailed it!!';
                this.message2 = 'Collision Time: ' + this.formatTimer() + " seconds!!";
            }else{
                this.sound.play(this.sound.lose);
                this.message1 = 'GAME OVER !!';
                this.message2 = 'Can you do it faster than ' + this.formatTimer() + " seconds ?";
            }
        }
    }

    drawStatusText() {
        this.ctx.save();
        this.ctx.fillText('Score: ' + this.score, this.width - 10, 30);
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Timer: ' + this.formatTimer(), 10, 30);
        if (this.gameOver) {
            this.ctx.textAlign = 'center';
            this.ctx.font = this.largeFont + 'px impact';
            this.ctx.fillText(this.message1, this.width * 0.5, this.height * 0.5-this.largeFont, this.width);
            this.ctx.font = this.smallFont + 'px impact';
            this.ctx.fillText(this.message2, this.width * 0.5, this.height * 0.5  -this.smallFont+20, this.width);
            this.ctx.fillText("Press 'R' to try again. ", this.width * 0.5, this.height * 0.5 - 80, this.width);
        }

        if (this.player.energy <= this.player.minEnergy) { this.ctx.fillStyle = 'darkorange'; }
        else if (this.player.energy >= this.player.maxEnergy) { this.ctx.fillStyle = 'red'; }

        for (let i = 0; i < this.player.energy; i++) {
            this.ctx.fillRect(10, this.height - 10 - this.player.barSize * i, this.player.barSize * 4, this.player.barSize);
        }
        this.ctx.restore();
    }
}

window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 720;

    const game = new Game(canvas, ctx);

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(deltaTime);
        requestAnimationFrame(animate);

    }
    requestAnimationFrame(animate);




})