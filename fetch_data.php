<?php 

header('Content-type: application/json');

echo json_encode( array(
	array( 
		id => 1,
		start => mktime(),
		end => mktime()+(86400),
		data => 'now() +1day' ),
	array(
		id => 2,
		start => mktime()+(86400*2),
		end => mktime()+(86400*4),
		data => 'Item +1day +3 Tage' ),
	array(
		id => 3,
		start => mktime()+(86400*2),
		end => mktime()+(86400*12),
		data => 'now() +1day 10days' ),
	array(
		id => 4,
		start => mktime()+(86400*6),
		end => mktime()+(86400*10)+43200,
		data => 'now()+6d 4days12hours' ),
	array(
		id => 5,
		start => mktime(17,0,0,12,24,date("Y")),
		end => mktime(23,59,59,12,24,date("Y")),
		cssclass => "xmas",
		data => 'Harley Abend<br/><img src="data/img/harley-engine.jpg" style="width:100%;height:auto;"/>' ),
	array(
		id => 6,
		start => mktime(0,0,0,12,31,date("Y")),
		end => mktime(23,59,59,12,31,date("Y")),
		data => 'Silvester' ),
	array(
		id => 7,
		start => mktime(0,0,0,1,1,date("Y")+1),
		end => mktime(23,59,59,1,1,date("Y")+1),
		data => 'Neujahr' )
) );
