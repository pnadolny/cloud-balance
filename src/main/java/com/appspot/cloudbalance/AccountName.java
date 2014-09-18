package com.appspot.cloudbalance;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;

public class AccountName {

	private static final String KIND = "AccountName";
	public static final String ACCOUNT_NAME = "ACCOUNT_NAME";

	public static Entity createOrUpdateItem(String accountName) {

		Entity option = getOption();
		if (option == null) {
			option = new Entity(KIND, ACCOUNT_NAME);
		}
		option.setProperty(ACCOUNT_NAME, accountName);
		Util.persistEntity(option);
		return null;
	}

	public static Entity getOption() {
		Key key = KeyFactory.createKey(KIND, ACCOUNT_NAME);
		return Util.findEntity(key);
	}
	 public static Iterable<Entity> getAccountName() {
		  Iterable<Entity> a =  Util.listEntities(KIND, null, null,Query.SortDirection.DESCENDING,0, null, null, null);
		  return a;
	  }
	 

}
