package com.appspot.cloudbalance;

import java.io.BufferedReader;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;

import com.google.appengine.api.datastore.Entity;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
@Path("import")
public class ImportServlet  {

	
	private static final Logger logger = Logger.getLogger(ImportServlet.class
			.getCanonicalName());

	
	@POST
	public void doPost(@Context HttpServletRequest request, @Context HttpServletResponse resp) throws Exception {
		
		logger.log(Level.INFO, "Import JSON");
		
		  StringBuffer jb = new StringBuffer();
		  String line = null;
		  BufferedReader reader = request.getReader();
		  while ((line = reader.readLine()) != null) {
			  jb.append(line);
		  }
		  String jsonstring = jb.toString(); 
		  JsonParser parser = new JsonParser();
		  JsonElement element = parser.parse(jsonstring);
		  if (element.isJsonObject()) {
			  JsonObject  jobject = element.getAsJsonObject();
			  JsonArray jarray = jobject.getAsJsonArray("data");
			  Iterator<JsonElement> i = jarray.iterator();
			  while (i.hasNext()) {
				  JsonElement e = i.next();
				  jobject = e.getAsJsonObject();
			      
				   Entity p=Payee.getPayee(jobject.get("payee").getAsString());
				   if (p==null) {
					   Payee.createOrUpdatePayee(jobject.get("payee").getAsString(), null,null);
				   }
				   Transaction.createOrUpdateItem(
						   jobject.get("payee").getAsString(), 
						   null, 
						   Double.valueOf(Math.abs(jobject.get("amount").getAsDouble())).toString(), 
						   jobject.get("date").getAsString(), 
						   jobject.get("memo").getAsString(),
						   (jobject.get("amount").getAsDouble() >=0 ? "d" :"w"));

				  logger.log(Level.INFO,"Creating..."+jobject.get("amount").getAsString());
				  
			  }
		  }
		  
	   
	}
}
