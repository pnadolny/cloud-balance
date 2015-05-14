package com.appspot.cloudbalance;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;


import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import com.google.gson.Gson;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@Path("user")
@Produces("application/json")
public class UserServlet {

	private static final UserService userService = UserServiceFactory.getUserService();

  private class UserInfo {
			 String userId;
			String email;
			String logoutURL;

	}

	@GET
	public String doGet() {

		UserInfo ui = new UserInfo();
		ui.userId = userService.getCurrentUser().getUserId();
		ui.email = userService.getCurrentUser().getEmail();
		ui.logoutURL = userService.createLogoutURL("/");

		List u = new ArrayList();
		u.add(ui);

		return new Gson().toJson(u);

  }
}
