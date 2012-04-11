package Config::IniFile;

sub new
{
	my $class = shift;
	my $configFile = shift;
	
	my $self = {
		"_configFile" => $configFile,
		"_sections" => {},
		"_parsed" => {}
	};

	bless $self, $class;
	
	$self->parseConfigFile();
	return $self;
}

sub getConfigFile
{
	my $self = shift;
	return $self->{"_configFile"};
}

sub parseConfigFile
{
	my $self = shift;
	open( FILE, "<" . $self->{"_configFile"}) 
		or die "Could not open configfile: ".$self->{"_configFile"};
	my $in_section = 0;
	my $currentSection;
	my $parsed = {};
	my $data = "";
	while( my $line = <FILE> )
	{
		$line =~ s/\r//; # Replace Windows newlines
		chomp $line;
		$data .= $line."\n";
	}
	close(FILE);
	
	foreach my $line ( split("\n", $data) )
	{
		chomp $line;
		
	    next if $line =~ /^#/;        # skip comments
	    next if $line =~ /^\s*$/;     # skip empty lines
	
	    if ($line =~ m/^\[(.*)\]/) {
	        $currentSection = $1;
	        if (!exists $parsed->{$currentSection} )
	        {
	        	$parsed->{$currentSection} = {};
	        }
	        next;
	    }
				
		next if (!$currentSection);

	    if ( $line =~ m/^(.*)\s*=\s*(.*)$/) {
	        $parsed->{$currentSection}->{$1} = $2;
	    }
	}

	$self->{"_parsed"} = $parsed;
	
	return $self->{"_parsed"}; 
}

sub getSectionKey
{
	my $self = shift;
	my $section = shift;
	my $key = shift;
	return $self->{"_parsed"}->{$section}->{$key};	
}

sub getSectionKeys
{
	my $self = shift;
	my $section = shift;
	return () if (!exists $self->{"_parsed"}->{$section});
	return keys %{ $self->{"_parsed"}->{$section} };
}

1;

__END__

=head1 NAME

Config::IniFile

=head1 DESCRIPTION

Class to read sectionkeys from an ini-file.

=head1 SYNOPSIS

=head2 &new

The constructor. Argument is the path to ini-configfile.

=head2 parseConfigFile

Private method. Used for parsing the config file.

=head2 &getSectionKey

Argument is the section name and the key. Returns the value of key.

=head2 &getSectionKeys

Argument is the section name as string. Returns all keys of section as
array.

=head1 SEE ALSO

=head1 AUTHOR

Holger Graf-Reichrt, holger@s87.de
