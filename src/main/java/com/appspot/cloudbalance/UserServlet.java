package com.appspot.cloudbalance;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@Path("user")
@Produces("application/json")
public class UserServlet {

	private static final UserService userService = UserServiceFactory.getUserService();

	@GET
	public String doGet() {
		Map<String, String> userData = new HashMap<String, String>();
		userData.put("userId", userService.getCurrentUser().getUserId());
		userData.put("email", userService.getCurrentUser().getEmail());
		userData.put("logoutURL", userService.createLogoutURL("/"));
		return Util.writeJSON(userData)	;
	}

}