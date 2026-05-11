from random import randrange
from turtle import *

from freegames import square, vector

food = vector(0, 0)
snake = [vector(10, 0)]
aim = vector(0, -10)
score = 0
high_score = 0
game_over_state = False


def change(x, y):
    """Change snake direction."""
    aim.x = x
    aim.y = y


def inside(head):
    """Return True if head inside boundaries."""
    return -200 < head.x < 190 and -200 < head.y < 190


def move():
    """Move snake forward one segment."""
    global score, high_score, game_over_state

    if game_over_state:
        return

    head = snake[-1].copy()
    head.move(aim)

    if not inside(head) or head in snake:
        if score > high_score:
            high_score = score
        game_over_state = True
        clear()
        square(head.x, head.y, 9, 'red')
        draw_game_over()
        update()
        return

    snake.append(head)

    if head == food:
        score += 1
        print('Snake:', len(snake), 'Score:', score)
        food.x = randrange(-15, 15) * 10
        food.y = randrange(-15, 15) * 10
    else:
        snake.pop(0)

    clear()
    for body in snake:
        square(body.x, body.y, 9, 'black')

    square(food.x, food.y, 9, 'green')
    draw_status()
    update()
    ontimer(move, 100)


def draw_status():
    penup()
    goto(-190, 180)
    color('black')
    write(f'Score: {score}  High Score: {high_score}', font=('Arial', 14, 'normal'))
    pendown()


def draw_game_over():
    penup()
    goto(0, 40)
    color('red')
    write('Game Over', align='center', font=('Arial', 24, 'bold'))

    penup()
    goto(-60, -20)
    color('lightgray')
    begin_fill()
    for _ in range(2):
        forward(120)
        left(90)
        forward(40)
        left(90)
    end_fill()

    penup()
    goto(0, -10)
    color('black')
    write('Restart', align='center', font=('Arial', 16, 'bold'))
    pendown()


def restart(x, y):
    global score, game_over_state

    if not game_over_state:
        return

    if -60 <= x <= 60 and -20 <= y <= 20:
        score = 0
        game_over_state = False
        snake.clear()
        snake.append(vector(10, 0))
        aim.x = 0
        aim.y = -10
        food.x = randrange(-15, 15) * 10
        food.y = randrange(-15, 15) * 10
        clear()
        move()


setup(420, 420, 370, 0)
hideturtle()
tracer(False)
listen()
onkey(lambda: change(10, 0), 'Right')
onkey(lambda: change(-10, 0), 'Left')
onkey(lambda: change(0, 10), 'Up')
onkey(lambda: change(0, -10), 'Down')
onscreenclick(restart)
move()
done()