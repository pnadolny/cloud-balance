package com.appspot.cloudbalance;

import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;

public class Payee {
	public static final String KIND = "Payee";
	public static final String ACCOUNT = "ACCOUNT"; // Considered the root entity.
	public static final String DEFAULT_ACCOUNT = "DEFAULT_ACCOUNT"; // app does not support multiple accounts yet. 
	
	public static Entity createOrUpdatePayee(String name, String description, String type) {
		Entity payee = getPayee(name);
		if (payee == null) {
			Entity account = new Entity(ACCOUNT,DEFAULT_ACCOUNT);
			Util.persistEntity(account);
			payee = new Entity(KIND, name, account.getKey());
		}
		payee.setProperty("description", description);
		payee.setProperty("type",type);
		Util.persistEntity(payee);
		return payee;
	}
	public static Iterable<Entity> getAllPayees() {
		Iterable<Entity> a = Util.listEntities(KIND, null, null,
				Query.SortDirection.DESCENDING, null, KeyFactory.createKey(ACCOUNT, DEFAULT_ACCOUNT));
		return a;
	}
	
	public static Entity getPayee(String name) {
			return Util.findEntity(KeyFactory.createKey(KeyFactory.createKey(ACCOUNT, DEFAULT_ACCOUNT), KIND, name));
	}

	public static String deletePayee(String name) {
		Key key = KeyFactory.createKey(KeyFactory.createKey(ACCOUNT, DEFAULT_ACCOUNT),KIND, name);
		Query q = new Query(Transaction.KIND);
		q.setAncestor(key);
		q.setKeysOnly();
		if (!DatastoreServiceFactory.getDatastoreService().prepare(q).asList(FetchOptions.Builder.withLimit(1)).isEmpty()) {
			return Util.getErrorMessage("Cannot delete as there are transactions associated with this payee.");
		}
		Util.deleteEntity(key);
		return KIND + "  "+key.getName() + " deleted successfully";

	}
}
