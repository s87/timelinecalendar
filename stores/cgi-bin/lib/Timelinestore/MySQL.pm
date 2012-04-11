package Timelinestore::MySQL;

use Timelinestore::Abstract;
use Data::Dumper;
use DBI;
use JSON;

@ISA = qw( Timelinestore::Abstract );

sub renderJson
{
	my $self = shift;
	my $cgi = $self->{"cgi"};
	my $config = $self->{"config"};

	$dbh = DBI->connect(
					'DBI:mysql:'.$config->getSectionKey("database","name"),
					$config->getSectionKey("database","user"), 
					$config->getSectionKey("database","pass") ) 
					|| die "Could not connect to database: $DBI::errstr";

	$dbh->{RaiseError} = 1;        # save having to check each method call
	$sth = $dbh->prepare("SELECT id,data,start,end FROM timelinecalendar LIMIT 50");
	my $rowCount = $sth->execute;
	
	my $x = 0;
	print "[";
	while( my $row = $sth->fetchrow_hashref )
	{
		$x++;
		print to_json( $row );
		print ",\n"
			if( $x < $rowCount );
	}
	print "]\n";
	$dbh->disconnect(); 
	return;
}

1;

__END__

=head1 NAME

Timelinestorer::MySQL

=head1 DESCRIPTION

Load items for JS-Timelinecalendar from MySQL database

=head2 SQL- and Perl-Setup

#shell> perl -MCPAN -e shell
#cpan> install DBI
#cpan> install DBD::mysql
#cpan> install JSON

CREATE TABLE timelinecalendar (
	id INT NOT NULL AUTO_INCREMENT,
	data text not null,
	start DATETIME NOT NULL,
	end DATETIME NOT NULL,
	PRIMARY KEY (id)
);

INSERT INTO `timelinecalendar` (`data`, `start`, `end`) VALUES ('DEMODATA 1', '2012-04-04 12:00:00', '2012-04-08 12:00:00');
INSERT INTO `timelinecalendar` (`data`, `start`, `end`) VALUES ('DEMODATA 2', '2012-04-04 18:00:00', '2012-04-07 10:00:00');
INSERT INTO `timelinecalendar` (`data`, `start`, `end`) VALUES ('Tag der Arbeit', '2012-05-01 00:00:00', '2012-05-01 23:59:59');
INSERT INTO `timelinecalendar` (`data`, `start`, `end`) VALUES ('Christi Himmelfahrt', '2012-05-17 00:00:00', '2012-05-17 23:59:59');

=head1 SEE ALSO

http://github.com/s87/timelinecalendar/

=head1 AUTHOR

Holger Graf-Reichrt, holger@s87.de

=head1 CHANGES

=over 1

=item 2012/04/12

Initial write. Replaces the DirWatchService in C++.

=back
