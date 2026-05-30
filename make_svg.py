import math
points = 20
inner_r = 45
outer_r = 50
center = 50
path = []

# Generate smooth wavy curve
# We want cubic beziers for smooth scallops.
# Actually, just many points along a sine wave offset
path = []
steps = 200
for i in range(steps + 1):
    angle = math.pi * 2 * i / steps
    # Sine wave perturbation
    r = 47 + 3 * math.sin(points * angle)
    x = center + r * math.cos(angle)
    y = center + r * math.sin(angle)
    if i == 0:
        path.append(f'M {x},{y}')
    else:
        path.append(f'L {x},{y}')

d = ' '.join(path) + ' Z'
svg = f'<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="{d}" fill="black"/></svg>'
with open('e:/victorssite/public/scallop.svg', 'w') as f:
    f.write(svg)
