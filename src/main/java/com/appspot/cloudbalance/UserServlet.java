package com.appspot.cloudbalance;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import java.util.ArrayList;
import java.util.List;

@Path("user")
@Produces("application/json")
public class UserServlet {

	private static final UserService userService = UserServiceFactory.getUserService();

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

  private class UserInfo {
			 String userId;
			String email;
			String logoutURL;

	}
}
