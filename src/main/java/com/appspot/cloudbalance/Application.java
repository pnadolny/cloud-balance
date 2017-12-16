package com.appspot.cloudbalance;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;

@ApplicationPath("ng")
public class Application extends ResourceConfig {
	public Application() {
	    packages("com.appspot.cloudbalance.resources");
    }
}
