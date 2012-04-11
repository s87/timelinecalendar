
package Timelinestore::Abstract;

sub new
{
	my $class = shift;
	my $cgi = shift;
	my $config = shift || null;
	
	my $self = {
		"cgi" => $cgi,
		"config" => $config
	};

	bless $self, $class;

	return $self;
}

sub getJson
{
	my $self = shift;
	my $cgi = $self->{"cgi"};	
	print $cgi->header(
				-type=>'application/json',
				-charset=>'UTF-8' );
	$self->renderJson(); # prints to stdout
	return;
}

sub renderJson
{
	my $self = shift;
	print "[]";
	return;
}

1;

__END__
