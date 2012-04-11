#!/usr/bin/perl

use strict;
use warnings;
use CGI;

our ($appDir, $libDir);

BEGIN
{
	if ( $0 =~ m/(.*)\\.*/ )
	{
		$libDir = $1."\\lib";	
	}
	else
	{
		$libDir = "./lib";
	}
}

use lib $libDir;

use Config::IniFile;
use Timelinestore::MySQL;

my $config = new Config::IniFile("config-mysql.ini");

my $store = Timelinestore::MySQL->new( new CGI(), $config );
print $store->getJson();

exit(0);
