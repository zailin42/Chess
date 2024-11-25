// Chess 클래스는 체스 게임을 초기화하고 제어하는 역할을 합니다.
class Chess {
    constructor() {
        this.chessPieces = [
            ['b_pawn', 'b_rook', 'b_knight', 'b_bishop', 'b_queen', 'b_king'],
            ['w_pawn', 'w_rook', 'w_knight', 'w_bishop', 'w_queen', 'w_king']
        ];
        this.chessBlocks = document.querySelectorAll("div.board > span");
        this.board = Array.from(Array(8), () => new Array(8).fill(0));
        this.turn = 1; // 1: white's turn, 2: black's turn
        this.prevSpot = null;
        this.form = new Form(this); // Form 클래스의 인스턴스를 생성
        this.resultBoard = document.querySelector("div.result");
        this.init(); // 체스 보드를 초기화
    }

    // 체스 보드를 초기화하는 메서드
    init() {
        for (let i = 0; i < 8; i++) {
            if (i < 5) {
                this.board[0][i] = '1' + (1 + i); // 초기 흑색 기물 배치
                this.board[7][i] = '0' + (1 + i); // 초기 백색 기물 배치
            } else {
                this.board[0][i] = '1' + (8 - i);
                this.board[7][i] = '0' + (8 - i);
            }
            this.board[1][i] = '10'; // 흑색 폰 배치
            this.board[6][i] = '00'; // 백색 폰 배치
        }
        this.renderChessBoard(); // 보드 렌더링
        this.addChessBlockClickEvent(); // 이벤트 리스너 추가
        document.oncontextmenu = () => {return false;} // 우클릭 메뉴 금지
    }

    // 각 셀에 클릭 이벤트 리스너를 추가하는 메서드
    addChessBlockClickEvent() {
        this.chessBlocks.forEach((span, index) => {
            span.onclick = () => this.chessBlockClickEvent(index);
        });
    }

    // 클릭 이벤트를 처리하는 메서드
    chessBlockClickEvent(index) {
        const cur = this.chessBlocks[index];
        const y = Math.floor(index / 8);
        const x = index % 8;

        // 빈 셀을 클릭한 경우
        if (this.board[y][x] === 0) {
            if (cur.classList.contains('path')) {
                this.board[y][x] = this.board[this.prevSpot[0]][this.prevSpot[1]];
                this.board[this.prevSpot[0]][this.prevSpot[1]] = 0;

                // 폰이 승격되는 경우
                if (this.board[y][x][1] === '0') {
                    if ((this.turn === 1 && y === 0) || (this.turn === 2 && y === 7)) {
                        this.board[y][x] = (this.turn - 1) + '4';
                    }
                }

                this.turn = 3 - this.turn; // 턴 변경
            }
            this.renderChessBoard();
        } else {
            const group = this.board[y][x][0];
            const type = this.board[y][x][1];

            // 적 기물을 클릭한 경우
            if (this.turn !== Number(group) + 1) {
                if (cur.classList.contains('eat')) {
                    // 왕을 잡는 경우
                    if (type === '5') {
                        this.resultBoard.style.display = 'block';
                        this.resultBoard.children[0].innerText = (this.turn === 1 ? 'Black' : 'White') + ' Win';
                    }

                    this.board[y][x] = this.board[this.prevSpot[0]][this.prevSpot[1]];
                    this.board[this.prevSpot[0]][this.prevSpot[1]] = 0;

                    // 폰이 승격되는 경우
                    if (this.board[y][x][1] === '0') {
                        if ((this.turn === 1 && y === 0) || (this.turn === 2 && y === 7)) {
                            this.board[y][x] = (this.turn - 1) + '4';
                        }
                    }

                    this.turn = 3 - this.turn;
                    this.renderChessBoard();
                }
                return;
            }

            this.renderChessBoard();
            this.prevSpot = [y, x]; // 현재 위치를 이전 위치로 저장

            // 기물의 타입에 따라 이동 경로 계산
            switch (type) {
                case '0':
                    this.form.pawn(y, x, (group === '0' ? 1 : -1));
                    break;
                case '1':
                    this.form.rook(y, x);
                    break;
                case '2':
                    this.form.knight(y, x);
                    break;
                case '3':
                    this.form.bishop(y, x);
                    break;
                case '4':
                    this.form.queen(y, x);
                    break;
                case '5':
                    this.form.king(y, x);
                    break;
            }
        }
    }

    // 보드를 렌더링하는 메서드
    renderChessBoard() {
        this.chessBlocks.forEach((span, index) => {
            const y = Math.floor(index / 8);
            const x = index % 8;
            let name = '';

            if (this.board[y][x] !== 0) {
                const group = this.board[y][x][0];
                const type = this.board[y][x][1];
                name = this.chessPieces[group][type];
            }

            span.className = name ? name : '';

            // 체스 보드의 흑백 셀 배경 설정
            if ((y % 2 === 0 && x % 2 !== 0) || (y % 2 !== 0 && x % 2 === 0)) {
                span.classList.add('blk');
            }
        });
    }
}

// Form 클래스는 말의 이동 경로를 계산하는 역할을 합니다.
class Form {
    constructor(chess) {
        this.chess = chess;
    }

    // 폰의 이동 경로를 계산하는 메서드
    pawn(y, x, group) {
        let xpos = x, ypos = y, max = 1;

        if (y * group === 6 || y * group === -1) max = 2;

        for (let i = 1; i <= max; i++) {
            ypos = y - i * group;
            if (this.chess.board[ypos][xpos] === 0) {
                this.chess.chessBlocks[ypos * 8 + xpos].className = 'path';
            } else break
        }

        ypos = y - group;
        for (let i = -1; i <= 1; i += 2) {
            xpos = x + i;
            if (this.chess.board[ypos][xpos] !== 0 && this.chess.board[ypos][xpos] !== undefined) {
                let group = this.chess.board[ypos][xpos][0];
                if (Number(group) + 1 !== this.chess.turn) {
                    this.chess.chessBlocks[ypos * 8 + xpos].classList.add('eat');
                }
            }
        }
    }

    // 룩의 이동 경로를 계산하는 메서드
    rook(y, x) {
        this.line(y, x);
    }

    // 나이트의 이동 경로를 계산하는 메서드
    knight(y, x) {
        let xpos = x, ypos = y;
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            ypos = y + i;
            for (let j = -1; j <= 1; j += 2) {
                xpos = x + (3 - Math.abs(i)) * j;
                if (!this.validRange(ypos, xpos)) continue;

                if (this.chess.board[ypos][xpos] === 0) {
                    this.chess.chessBlocks[ypos * 8 + xpos].className = 'path';
                } else {
                    if (Number(this.chess.board[ypos][xpos][0]) + 1 !== this.chess.turn) {
                        this.chess.chessBlocks[ypos * 8 + xpos].classList.add('eat');
                    }
                }
            }
        }
    }

    // 비숍의 이동 경로를 계산하는 메서드
    bishop(y, x) {
        this.crossLine(y, x);
    }

    // 퀸의 이동 경로를 계산하는 메서드
    queen(y, x) {
        this.line(y, x);
        this.crossLine(y, x);
    }

    // 킹의 이동 경로를 계산하는 메서드
    king(y, x) {
        this.line(y, x, 1);
        this.crossLine(y, x, 1);
    }

    // 유효한 범위인지 확인하는 메서드
    validRange(y, x) {
        return y > -1 && x > -1 && y < 8 && x < 8;
    }

    // 직선 이동 경로를 계산하는 메서드
    line(y, x, max = 7) {
        let xpos = x, ypos = y;
        for (let i = -1; i <= 1; i += 2) {
            for (let j = 1; j <= max; j++) {
                ypos = y + j * i;
                if (!this.validRange(ypos, x)) break;
                if (this.chess.board[ypos][x] === 0) {
                    this.chess.chessBlocks[ypos * 8 + x].className = 'path';
                } else {
                    if (Number(this.chess.board[ypos][x][0]) + 1 !== this.chess.turn) {
                        this.chess.chessBlocks[ypos * 8 + x].classList.add('eat');
                    }
                    break;
                }
            }

            for (let j = 1; j <= max; j++) {
                xpos = x + j * i;
                if (!this.validRange(y, xpos)) break;
                if (this.chess.board[y][xpos] === 0) {
                    this.chess.chessBlocks[y * 8 + xpos].className = 'path';
                } else {
                    if (Number(this.chess.board[y][xpos][0]) + 1 !== this.chess.turn) {
                        this.chess.chessBlocks[y * 8 + xpos].classList.add('eat');
                    }
                    break;
                }
            }
        }
    }

    // 대각선 이동 경로를 계산하는 메서드
    crossLine(y, x, max = 7) {
        let xpos = x, ypos = y;
        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                for (let k = 1; k <= max; k++) {
                    xpos = x + k * i;
                    ypos = y + k * j;
                    if (!this.validRange(ypos, xpos)) break;
                    if (this.chess.board[ypos][xpos] === 0) {
                        this.chess.chessBlocks[ypos * 8 + xpos].className = 'path';
                    } else {
                        if (Number(this.chess.board[ypos][xpos][0]) + 1 !== this.chess.turn) {
                            this.chess.chessBlocks[ypos * 8 + xpos].classList.add('eat');
                        }
                        break;
                    }
                }
            }
        }
    }
}

// DOMContentLoaded 이벤트가 발생하면 체스 게임을 초기화합니다.
document.addEventListener("DOMContentLoaded", () => {
    new Chess();
});