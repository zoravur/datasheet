# Coordinate naming conventions

base coordinates
x -- pixel horizontal coordinate
y -- pixel vertical coordinate
i -- grid vertical coordinate
j -- grid horizontal coordinate

coordinate modifiers
a[base coordinate] -- absolute coordinate (relative to top left corner when scroll = (0,0))
    - (ax, ay) = (0,0) <=> (ax, ay) is origin of the canvas
    - (ai, aj) = (0,0) <=> (ai, aj) is the first, leftmost grid cell.
r[base coordinate] -- relative coordinate (relative to top left visible point)
    - (rx, ry) = (0,0) <=> (rx, ry) is the current scroll offset of the canvas.
    - (ri, rj) = (0,0) <=> (ri, rj) is the first, leftmost cell that is at least partially visible.

variables:
(scroll_ax, scroll_ay) -- current scroll offset
