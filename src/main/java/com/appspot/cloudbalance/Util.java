
package com.appspot.cloudbalance;

import com.google.appengine.api.datastore.*;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;

import java.util.Iterator;
import java.util.List;
public class Util {


	private static DatastoreService datastore = DatastoreServiceFactory
			.getDatastoreService();

	public static void persistEntity(Entity entity) {
		datastore.put(entity);
	}
	public static void deleteEntity(Key key) {
		datastore.delete(key);
	}
	public static void deleteEntity(final List<Key> keys) {
		datastore.delete(new Iterable<Key>() {
			public Iterator<Key> iterator() {
				return keys.iterator();
			}
		});
	}
	public static Entity findEntity(Key key) {
		try {
			return datastore.get(key);
		} catch (EntityNotFoundException e) {
			return null;
		}
	}

	public static Iterable<Entity> listEntities(String kind, String searchBy,
			String searchFor, Query.SortDirection direction, Object newParam, Key ancestorKey) {

		Query query = null;
		query = new Query(kind);

		if (ancestorKey != null) {
			query.setAncestor(ancestorKey);
		}
		if (Transaction.KIND.equals(kind)) {
			// query.addSort("ID",direction);
			query.addSort("date", direction);
		}

		if (searchFor != null && !"".equals(searchFor)) {
			Filter searchFilter = new FilterPredicate(searchBy,
					FilterOperator.EQUAL, searchFor);
			query.setFilter(searchFilter);
		}
			FetchOptions fetchOptions = FetchOptions.Builder.withDefaults();
			PreparedQuery queryString = datastore.prepare(query);
			return queryString.asIterable(fetchOptions);

	}






	
	public static String getErrorMessage(Exception ex)  {
		StringBuilder sb = new StringBuilder();
		sb.append("{");
		sb.append("\"" + "apiVersion" + "\" : \"" + "1.0" + "\",");
		sb.append("\"" + "error" + "\" : " + "{");
		sb.append("\"code" + "\" : \"" + "404" + "\",");
		sb.append("\"" + "message" + "\" : \"" + ex.toString() + "\",");
		sb.append("\"" + "errors" + "\" : " + "[{");
		sb.append("\"" + "domain" + "\" : \"" + "future" + "\",");
		sb.append("\"" + "reason" + "\" : \"" + "future" + "\",");
		sb.append("\"" + "message" + "\" : \"" + "future" + "\"");
		sb.append("}]");
		sb.append("}");
		sb.append("}");
		return sb.toString();
	}

	public static String getErrorMessage(String errorMessage) {

		StringBuilder sb = new StringBuilder();
		sb.append("{");
		sb.append("\"" + "apiVersion" + "\" : \"" + "1.0" + "\",");
		sb.append("\"" + "error" + "\" :" + "{");
		sb.append("\"code" + "\" : \"" + "404" + "\",");
		sb.append("\"" + "message" + "\" : \"" + errorMessage + "\",");
		sb.append("\"" + "errors" + "\" : " + "[{");
		sb.append("\"" + "domain" + "\" : \"" + "future" + "\",");
		sb.append("\"" + "reason" + "\" : \"" + "future" + "\",");
		sb.append("\"" + "message" + "\" : \"" + "future" + "\"");
		sb.append("}]");
		sb.append("}");
		sb.append("}");
		return sb.toString();

	}
	
	public static String getJsonSuccessMessage(String message) {
		
		
		StringBuilder sb = new StringBuilder();
		sb.append("{");
		sb.append("\"" + "apiVersion" + "\" : \"" + "1.0" + "\",");
		sb.append("\"" + "success" + "\" :" + "{");
		sb.append("\"code" + "\" : \"" + "0" + "\",");
		sb.append("\"" + "message" + "\" : \"" + message + "\",");
		sb.append("\"" + "errors" + "\" : " + "[{");
		sb.append("\"" + "domain" + "\" : \"" + "future" + "\",");
		sb.append("\"" + "reason" + "\" : \"" + "future" + "\",");
		sb.append("\"" + "message" + "\" : \"" + "future" + "\"");
		sb.append("}]");
		sb.append("}");
		sb.append("}");
		return sb.toString();

	}
	

	/**
	 * get DatastoreService instance
	 * 
	 * @return DatastoreService instance
	 */
	public static DatastoreService getDatastoreServiceInstance() {
		return datastore;
	}



}