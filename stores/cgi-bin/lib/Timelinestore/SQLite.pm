package Timelinestore::SQLite;

use Timelinestore::Abstract;
use Data::Dumper;
@ISA = qw( Timelinestore::Abstract );

#shell> perl -MCPAN -e shell
#cpan> install DBI
#cpan> install DBD::SQLite
#cpan> install JSON

use DBI;

sub renderJson
{
	my $self = shift;
	my $cgi = $self->{"cgi"};
	my $config = $self->{"config"};

	# currently not implemented
	my $dbh = DBI->connect("dbi:SQLite:dbname=timelinecal.db","","")
				or die ;

	print "[]";
	return;
}

1;

__END__
