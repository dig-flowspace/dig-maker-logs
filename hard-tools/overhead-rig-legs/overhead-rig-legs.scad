/*
 * Telescoping legs for the table top overhead shooting rig
 *
 * Remix of "Tabletop overhead shooting rig" by flummer
 * makerworld.com/en/models/1556093
 *
 * The rig's own parts are used unchanged, generated from flummer's
 * OverheadShootingRig.scad at the new tube sizes. This file adds only
 * what the legs need: a sleeve, a collar, a top bushing and a drill jig.
 *
 * Drafted by Claude for the-workshop
 *
 * License: CC-BY-SA
 *
 */

resolution = 100;

/*
 * Variables for Customizer
 * ==================================================================
 *
 */

// ------------------------------------------------------------------
/* [Tube dimensions] */

// outer diameter of the upper tube, the one in the joiner (in mm, 3/4" EMT is 23.4)
Upper_Tube_Diameter = 23.4; //[15:0.1:25]

// inner diameter of the upper tube (in mm, 3/4" EMT is 20.9)
Upper_Tube_Bore = 20.9; //[10:0.1:24]

// outer diameter of the lower tube, the one that slides (in mm, 1/2" EMT is 17.9)
Lower_Tube_Diameter = 17.9; //[10:0.1:22]

// ------------------------------------------------------------------
/* [Height holes] */

// distance from the end of the lower tube to the nearest height hole (in mm)
First_Hole = 60; //[30:1:150]

// distance between the two height hole guides on the drill jig (in mm)
Hole_Spacing = 130; //[50:1:200]

// drill for the screw holes in the upper tube (in mm, 1/4" is 6.35)
Bolt_Drill = 6.5; //[6:0.05:7]

// drill for the height holes in the lower tube (in mm, 13/64" is 5.16)
Seat_Drill = 5; //[4.5:0.05:5.5]

// ------------------------------------------------------------------
/* [Part selection for export] */

// Use this to generate the individual parts, so that you can export STL files for each part
Part = "Preview"; //["Preview","Section","Parts","Sleeve","Collar","TopBushing","DrillJig"]

// ------------------------------------------------------------------
/* [Advanced settings] */

// clearance on the collar bore, same as on the joiner sockets (in mm)
Collar_Clearance = 0.3; //[0:0.05:1]

// clearance between the sleeve and the lower tube (in mm)
Slide_Clearance = 0.25; //[0:0.05:1]

// how much smaller the sleeve is than the upper tube bore, negative presses tighter (in mm)
Sleeve_Fit = 0.05; //[-0.2:0.05:0.5]

// how much bigger the top bushing is than the upper tube bore, so it drags instead of rattles (in mm)
Bushing_Drag = 0.2; //[0:0.05:0.6]

// extra size on the jig's drill guides, printed holes come out small (in mm)
Guide_Clearance = 0.3; //[0:0.05:0.6]


/*
 * Fixed dimensions
 * ==================================================================
 *
 * The height table in the build notes depends on screw_offset,
 * change it and the hole positions move with it.
 *
 */

screw_offset = 20;      // end of the upper tube to the locking screw
collar_wall = 3;
collar_floor = 6;
collar_depth = 32;
boss_radius = 9;
boss_reach = 22;        // leg axis to the face the finger screw stops against
nut_pocket_end = 17.4;  // leg axis to the outer face of the nut pocket
sleeve_length = 35;
bushing_length = 20;
jig_width = 34;
jig_height = 26;
jig_v_depth = 12;       // underside of the jig to the bottom of the V
jig_stop = 4;


/*
 * metric_hex
 * ==================================================================
 *
 * Used to make cutouts in objects that holds a metric nut or hex-screw
 *
 * Copied unchanged from flummer's OverheadShootingRig.scad (CC-BY-SA)
 *
 */
module metric_hex(size, length, head, head_height)
{
	union()
	{
		translate([0, 0, length/2-1])
			cylinder(r = size/2, h = length+2, center = true, $fn = resolution);

		translate([0, 0, -head_height/2])
		rotate(60, [0, 0, 0])
			cube([head/2*1.1547, head, head_height], center = true);
		rotate(60, [0, 0, 1])
		translate([0, 0, -head_height/2])
			cube([head/2*1.1547, head, head_height], center = true);
		translate([0, 0, -head_height/2])
		rotate(-60, [0, 0, 1])
			cube([head/2*1.1547, head, head_height], center = true);

	}
}

/*
 * sleeve
 * ==================================================================
 *
 * Pressed into the bottom of the upper tube. Fills the gap between
 * the two tubes, and takes the push from the locking screw.
 *
 */
module sleeve()
{
	difference()
	{
		cylinder(d = Upper_Tube_Bore - Sleeve_Fit, h = sleeve_length, $fn = resolution*2);

		translate([0, 0, -0.1])
			cylinder(d = Lower_Tube_Diameter + Slide_Clearance, h = sleeve_length + 0.2, $fn = resolution*2);

		// lines up with the screw hole in the upper tube
		translate([0, 0, screw_offset])
		rotate(-90, [1, 0, 0])
			cylinder(d = Bolt_Drill, h = Upper_Tube_Bore, $fn = 50);

		// chamfer, so it finds its way into the upper tube
		translate([0, 0, sleeve_length - 0.6])
		difference()
		{
			cylinder(d = Upper_Tube_Bore + 1, h = 1, $fn = resolution*2);
			translate([0, 0, -0.01])
				cylinder(d1 = Upper_Tube_Bore - Sleeve_Fit, d2 = Upper_Tube_Bore - Sleeve_Fit - 1.4, h = 0.62, $fn = resolution*2);
		}
	}
}

/*
 * collar
 * ==================================================================
 *
 * Slides over the bottom of the upper tube and holds the nut for the
 * locking screw. The nut pocket opens into the bore: thread the nut
 * onto the finger screw from the inside and pull it into place.
 *
 */
module collar()
{
	bore = Upper_Tube_Diameter + Collar_Clearance;
	outer = bore + collar_wall*2;
	screw_height = collar_floor + screw_offset;

	difference()
	{
		union()
		{
			cylinder(d = outer, h = collar_floor + collar_depth, $fn = resolution*2);

			// screw boss, the underside slopes at 45 degrees so it prints without support
			hull()
			{
				translate([0, 0, screw_height])
				rotate(-90, [1, 0, 0])
					cylinder(r = boss_radius, h = boss_reach, $fn = 70);

				translate([-boss_radius, outer/2 - 2, screw_height - boss_radius - (boss_reach - (outer/2 - 2))])
					cube([boss_radius*2, 0.01, 0.01]);
			}
		}
		union()
		{
			// upper tube
			translate([0, 0, collar_floor])
				cylinder(d = bore, h = collar_depth + 0.1, $fn = resolution*2);

			// lower tube passes through the floor
			translate([0, 0, -0.1])
				cylinder(d = Lower_Tube_Diameter + 0.7, h = collar_floor + 0.2, $fn = resolution);

			// nut pocket and screw hole, pointy side up so it prints without support
			translate([0, nut_pocket_end, screw_height])
			rotate(-90, [1, 0, 0])
			rotate(90, [0, 0, 1])
				metric_hex(Bolt_Drill, 50, 10, 6);
		}
	}
}

/*
 * top_bushing
 * ==================================================================
 *
 * Print in TPU. Sits on the top end of the lower tube and drags a
 * little in the upper tube, so the leg doesn't rattle and doesn't
 * drop when the screw is loosened.
 *
 */
module top_bushing()
{
	difference()
	{
		cylinder(d = Upper_Tube_Bore + Bushing_Drag, h = bushing_length, $fn = resolution*2);

		translate([0, 0, -0.1])
			cylinder(d = Lower_Tube_Diameter - 0.1, h = bushing_length + 0.2, $fn = resolution*2);
	}
}

/*
 * drill_jig
 * ==================================================================
 *
 * A V-block that sits on top of either tube, with the tube end pushed
 * against the stop. Every hole in both tubes is drilled through it,
 * so all four legs come out the same.
 *
 */
module drill_jig()
{
	length = First_Hole + Hole_Spacing + 15;
	guides = [[10, Bolt_Drill], [screw_offset, Bolt_Drill], [First_Hole, Seat_Drill], [First_Hole + Hole_Spacing, Seat_Drill]];

	difference()
	{
		translate([-jig_stop, -jig_width/2, 0])
			cube([length + jig_stop, jig_width, jig_height]);

		// V groove along the underside, closed by the stop at the near end
		rotate([90, 0, 90])
		linear_extrude(height = length + 0.1)
			polygon([[-(jig_v_depth + 1), -1], [jig_v_depth + 1, -1], [0, jig_v_depth]]);

		for(g = guides)
		{
			translate([g[0], 0, -0.1])
				cylinder(d = g[1] + Guide_Clearance, h = jig_height + 0.2, $fn = 50);

			// distance from the stop, engraved next to each guide
			translate([g[0], jig_width/2 - 7, jig_height - 0.6])
			linear_extrude(height = 1)
				text(str(g[0]), size = 4, halign = "center", valign = "center");
		}
	}
}

/*
 * Preview helpers
 * ==================================================================
 *
 */
module tube(outer_diameter, inner_diameter, length)
{
	difference()
	{
		cylinder(d = outer_diameter, h = length, $fn = resolution);
		translate([0, 0, -0.1])
			cylinder(d = inner_diameter, h = length + 0.2, $fn = resolution);
	}
}

module locking_screw()
{
	// M6 x 30 with the end ground to a 90 degree point, in a finger screw
	color("#bbbbbb")
	rotate(-90, [1, 0, 0])
	union()
	{
		translate([0, 0, 3])
			cylinder(d = 6, h = 30 - 3, $fn = 40);
		cylinder(d1 = 0, d2 = 6, h = 3, $fn = 40);
	}

	color("#333333")
	translate([0, 30 - 11, 0])
	rotate(-90, [1, 0, 0])
	union()
	{
		cylinder(d = 16, h = 15, $fn = 60);
		translate([0, 0, 15 - 9])
			cylinder(d = 28, h = 9, $fn = 60);
	}
}

module half(cut)
{
	// keeps the x > 0 half, so a cut face shows the colour of its own part
	if(cut)
		intersection()
		{
			children();
			translate([0, -100, -200])
				cube([100, 200, 400]);
		}
	else
		children();
}

module leg_joint(cut)
{
	// the leg set to its tallest height, the upper tube stands on the collar floor
	screw_height = collar_floor + screw_offset;
	lower_top = screw_height + First_Hole;

	color("#555555") half(cut) collar();
	color("#e08a2c") half(cut) translate([0, 0, collar_floor]) sleeve();
	color("#6fbf4a") half(cut) translate([0, 0, lower_top - bushing_length]) top_bushing();

	color("#9aa0a6")
	half(cut)
	difference()
	{
		translate([0, 0, collar_floor])
			tube(Upper_Tube_Diameter, Upper_Tube_Bore, 110);
		translate([0, 0, screw_height])
		rotate(-90, [1, 0, 0])
			cylinder(d = Bolt_Drill, h = Upper_Tube_Diameter, $fn = 50);
	}

	color("#c8ccd0")
	half(cut)
	difference()
	{
		translate([0, 0, lower_top - 150])
			tube(Lower_Tube_Diameter, Lower_Tube_Diameter - 2.1, 150);
		translate([0, 0, screw_height])
		rotate(-90, [1, 0, 0])
			cylinder(d = Seat_Drill, h = Lower_Tube_Diameter, $fn = 50);
	}

	// the nut, pulled out against the end of its pocket
	color("#bbbbbb")
	half(cut)
	translate([0, nut_pocket_end - 5, screw_height])
	rotate(-90, [1, 0, 0])
	rotate(30, [0, 0, 1])
	difference()
	{
		cylinder(r = 10/sqrt(3), h = 5, $fn = 6);
		translate([0, 0, -0.1])
			cylinder(d = 6, h = 5.2, $fn = 30);
	}

	// a 90 degree point seats where its radius matches the hole's
	translate([0, Lower_Tube_Diameter/2 - Seat_Drill/2, screw_height]) locking_screw();
}

module printable_parts()
{
	color("#555555") collar();

	translate([40, 0, 0])
		color("#e08a2c") sleeve();

	translate([70, 0, 0])
		color("#6fbf4a") top_bushing();

	translate([-20, -45, 0])
		color("#555555") drill_jig();
}


if(Part == "Preview")
{
	leg_joint(false);

	translate([60, 0, 0])
		printable_parts();
}

if(Part == "Section")
{
	leg_joint(true);
}

if(Part == "Parts")
{
	printable_parts();
}

if(Part == "Sleeve")
{
	sleeve();
}

if(Part == "Collar")
{
	collar();
}

if(Part == "TopBushing")
{
	top_bushing();
}

if(Part == "DrillJig")
{
	drill_jig();
}
