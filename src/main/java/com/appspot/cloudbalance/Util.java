
package com.appspot.cloudbalance;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
public class Util {

	private static final Logger logger = Logger.getLogger(Util.class
			.getCanonicalName());
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

	public static Iterable<Entity> listChildren(String kind, Key ancestor) {
		Query q = new Query(kind);
		Filter searchFilter = new FilterPredicate(Entity.KEY_RESERVED_PROPERTY,
				FilterOperator.GREATER_THAN, ancestor);
		q.setFilter(searchFilter);
		q.setAncestor(ancestor);
		return datastore.prepare(q).asIterable();
	}

	public static Iterable<Entity> listChildKeys(String kind, Key ancestor) {
		logger.log(Level.INFO, "Search entities based on parent");
		Query q = new Query(kind);
		q.setAncestor(ancestor).setKeysOnly();
		q.setFilter(new FilterPredicate(Entity.KEY_RESERVED_PROPERTY,
				FilterOperator.GREATER_THAN, ancestor));
		return datastore.prepare(q).asIterable();
	}

	public static String writeJSON(Entity e) {
		List<Entity> entities = new ArrayList<Entity>();
		entities.add(e);
		return writeJSON(entities, null);

	}

	public static String writeJSON(Entity e, Map<String, String> moreValues) {
		List<Entity> entities = new ArrayList<Entity>();
		entities.add(e);
		return writeJSON(entities, moreValues);

	}

	/**
	 * List the entities in JSON format
	 * 
	 * @param entities
	 *            entities to return as JSON strings
	 */
	public static String writeJSON(Iterable<Entity> entities,
			Map<String, String> moreValues) {
		logger.log(Level.INFO, "creating JSON format object");
		StringBuilder sb = new StringBuilder();

		int i = 0;
		sb.append("{\"data\": [");
		for (Entity result : entities) {
			Map<String, Object> properties = result.getProperties();
			sb.append("{");
			if (result.getKey().getName() == null)
				sb.append("\"name\" : \"" + result.getKey().getId() + "\",");
			else
				sb.append("\"name\" : \"" + result.getKey().getName() + "\",");

			for (String key : properties.keySet()) {
				if ("java.util.Date".equals(properties.get(key).getClass()
						.getCanonicalName())) {

					SimpleDateFormat formatShort = new SimpleDateFormat(
							Constants.DATE_FORMAT);

					sb.append("\"" + key + "\" : \""
							+ formatShort.format(properties.get(key)) + "\",");
				} else {
					sb.append("\"" + key + "\" : \"" + properties.get(key)
							+ "\",");
				}

			}
			if (moreValues != null) {
				for (String key : moreValues.keySet()) {
					sb.append("\"" + key + "\" : \"" + moreValues.get(key)
							+ "\",");
				}
			}

			sb.deleteCharAt(sb.lastIndexOf(","));
			sb.append("},");
			i++;
		}
		if (i > 0) {
			sb.deleteCharAt(sb.lastIndexOf(","));
		}
		sb.append("]}");
		logger.log(Level.INFO, sb.toString());
		return sb.toString();
	}

	
	public static String writeJSON(Iterable<Entity> entities, String childKind,
			String fkName, int offset) {
		logger.log(Level.INFO,
				"creating JSON format object for parent child relation");
		StringBuilder sb = new StringBuilder();
		int i = 0;
		sb.append("{\"data\": [");
		for (Entity result : entities) {
			Map<String, Object> properties = result.getProperties();
			sb.append("{");
			if (result.getKey().getName() == null)
				sb.append("\"name\" : \"" + result.getKey().getId() + "\",");
			else
				sb.append("\"name\" : \"" + result.getKey().getName() + "\",");
			for (String key : properties.keySet()) {
				sb.append("\"" + key + "\" : \"" + properties.get(key) + "\",");
			}
			Iterable<Entity> child = listEntities(childKind, fkName,
					String.valueOf(result.getKey().getName()),
					Query.SortDirection.DESCENDING,  null, null);
			for (Entity en : child) {
				for (String key : en.getProperties().keySet()) {
					sb.append("\"" + key + "\" : \""
							+ en.getProperties().get(key) + "\",");
				}
			}
			sb.deleteCharAt(sb.lastIndexOf(","));
			sb.append("},");
			i++;
		}
		if (i > 0) {
			sb.deleteCharAt(sb.lastIndexOf(","));
		}
		sb.append("]}");
		return sb.toString();
	}

	
	public static String getErrorMessage(Exception ex) throws IOException {
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

	public static String writeJSON(Map<String, String> m) {
		logger.log(Level.INFO, "creating JSON format object");
		StringBuilder sb = new StringBuilder();
		int i = 0;
		sb.append("[");
		for (Map.Entry<String, String> e : m.entrySet()) {
			sb.append("{");
			sb.append("\"" + e.getKey() + "\" : \"" + e.getValue() + "\",");
			sb.deleteCharAt(sb.lastIndexOf(","));
			sb.append("},");
			i++;
		}
		if (i > 0) {
			sb.deleteCharAt(sb.lastIndexOf(","));
		}
		sb.append("]");
		logger.log(Level.INFO, sb.toString());
		return sb.toString();
	}

}