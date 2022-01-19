# Datasets
All provided datasets make use of inputs scaled from -1.5 to 1.5. As detailed on the NViz site, outputs are normalized (scaled 0 to 1). 
`training.json` (n=1000) is used for model training, while `inputs.json` (n=100) is used for model testing.

## 2x1_Circle
2 inputs, 1 output

### Inputs
- -1.5 ≤ x ≤ 1.5
- -1.5 ≤ y ≤ 1.5

### Objective
Solve the circle inequality x<sup>2</sup> + y<sup>2</sup> < 1.0
 - i.e. Determine whether a point with coordinates (x, y) fits inside a circle of radius 1.0 centered at origin

### Output
- 1 if input satisfies inequality (point fits in circle)
- 0 if input does not satisfy inequality (point lies outside circle)

## 2x1_Classification
2 inputs, 1 output

### Inputs
- -1.5 ≤ x ≤ 1.5
- -1.5 ≤ y ≤ 1.5

### Objective
Classify points (x, y) based on region of 3x3 graph centered at origin.
Regions: 
- Points closest to (0, 1)
- Points closest to (1, 0)
- Points closest to (0, -1)
- Points closest to (-1, -1)

### Output
- 0.25 if input is closest to point (0, 1)
- 0.50 if input is closest to point (1, 0)
- 0.75 if input is closest to point (0, -1)
- 1.0 if input is closest to point (-1, -1)

## 3x1_Bounds
3 inputs, 1 output

### Inputs
- -1.5 ≤ n<sub>1</sub> ≤ 1.5
- -1.5 ≤ n<sub>2</sub> ≤ 1.5
- -1.5 ≤ n<sub>3</sub> ≤ 1.5

### Objective
Determine whether any input n<sub>i</sub> satisfies bound inequalities |n<sub>i</sub>| < 0.25 or |n<sub>i</sub>| > 1.25.
- In doing so, also determine whether 3D point (x=n<sub>1</sub>, y=n<sub>2</sub>, z=n<sub>3</sub>) fits complicated shape.

### Output
- 1 if any input n<sub>i</sub> satisfies either |n<sub>i</sub>| < 0.25 or |n<sub>i</sub>| > 1.25
- 0 if neither inequality is satisfied by any input.

## 3x1_Circle_Dead
3 inputs, 1 output

### Inputs
- -1.5 ≤ x ≤ 1.5
- -1.5 ≤ y ≤ 1.5
- -1.5 ≤ z ≤ 1.5

### Objective
Determine whether inputs x and y solve circle inequality x<sup>2</sup> + y<sup>2</sup> < 1.0.
- Input z acts as a "dead" input, i.e. should have no influence on output

### Output
- 1 if input satisfies inequality (point (x,y) fits in circle)
- 0 if input does not satisfy inequality (point (x, y) lies outside circle)

## 3x1_Sphere
3 inputs, 1 output

### Inputs
- -1.5 ≤ x ≤ 1.5
- -1.5 ≤ y ≤ 1.5
- -1.5 ≤ z ≤ 1.5

### Objective
Solve the sphere inequality x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup> < 1.0
 - i.e. Determine whether a point with coordinates (x, y, z) fits inside a sphere of radius 1.0 centered at origin

### Output
- 1 if input satisfies inequality (point fits in sphere)
- 0 if input does not satisfy inequality (point lies outside sphere)

## 3x2_Sphere_Signed
3 inputs, 2 outputs

### Inputs
- -1.5 ≤ x ≤ 1.5
- -1.5 ≤ y ≤ 1.5
- -1.5 ≤ z ≤ 1.5

### Objective
Output 1: Solve sphere inequality x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup> < 1.0
Output 2: Determine whether sum of input is positive (x + y + z > 0)

### Outputs
- Output 1
	- 1 if input satisfies inequality (point fits in sphere)
	- 0 if input does not satisfy inequality (point lies outside sphere)
- Output 2
	- 1 if sum of input is positive (x + y + z > 0)
	- 0 if sum of input is not positive (x + y + z ≤ 0)

## 4x2_Signed
4 inputs, 2 outputs

### Inputs 
- -1.5 ≤ a ≤ 1.5
- -1.5 ≤ b ≤ 1.5
- -1.5 ≤ c ≤ 1.5
- -1.5 ≤ d ≤ 1.5

### Objective 
Output 1: Determine whether sum of input 1 and 3 is positive (a + c > 0)
Output 2: Determine whether sum of input 2 and 4 is positive (b + d > 0)

### Outputs
- Output 1
	- 1 if sum of input 1 and 3 is positive (a + c > 0)
	- 0 if sum of input 1 and 3 is not positive (a + c ≤ 0)
- Output 2
	- 1 if sum of input 2 and 4 is positive (b + d > 0)
	- 0 if sum of input 2 and 4 is not positive (b + d ≤ 0)


