// Copyright 2011, Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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

/**
 * This is the utility class for all servlets. It provides method for inserting,
 * deleting, searching the entity from data store. Also contains method for
 * displaying the entity in JSON format.
 * 
 */
public class Util {

	private static final Logger logger = Logger.getLogger(Util.class
			.getCanonicalName());
	private static DatastoreService datastore = DatastoreServiceFactory
			.getDatastoreService();

	/**
	 * 
	 * @param entity
	 *            : entity to be persisted
	 */
	public static void persistEntity(Entity entity) {
		logger.log(Level.INFO, "Saving entity");
		datastore.put(entity);
	}

	/**
	 * Delete the entity from persistent store represented by the key
	 * 
	 * @param key
	 *            : key to delete the entity from the persistent store
	 */
	public static void deleteEntity(Key key) {
		logger.log(Level.INFO, "Deleting entity");
		datastore.delete(key);
	}

	/**
	 * Delete list of entities given their keys
	 * 
	 * @param keys
	 */
	public static void deleteEntity(final List<Key> keys) {
		datastore.delete(new Iterable<Key>() {
			public Iterator<Key> iterator() {
				return keys.iterator();
			}
		});
	}

	
	public static Entity findEntity(Key key) {
		logger.log(Level.INFO, "Search the entity");
		try {
			return datastore.get(key);
		} catch (EntityNotFoundException e) {
			return null;
		}
	}

	public static Iterable<Entity> listEntities(String kind, String searchBy,
			String searchFor, Query.SortDirection direction, int offset, Object newParam, QueryCallback callback, Key ancestorKey) {
		
		Query query = null;
		query = new Query(kind);

		if (ancestorKey!=null) {
			query.setAncestor(ancestorKey);
		}
		if (Transaction.KIND.equals(kind)) {
			//query.addSort("ID",direction);
			query.addSort("date",direction);
		}
		
		
		if (searchFor != null && !"".equals(searchFor)) {
			Filter searchFilter = new FilterPredicate(searchBy,  FilterOperator.EQUAL, searchFor);
			query.setFilter(searchFilter);
		}
		if (offset==-1) {
			FetchOptions fetchOptions = FetchOptions.Builder.withDefaults();
			PreparedQuery queryString = datastore.prepare(query);
			if (callback!=null) {
				callback.setRecordCount(queryString.countEntities(FetchOptions.Builder.withDefaults()));
			}
			return queryString.asIterable(fetchOptions);
		} else {
			FetchOptions fetchOptions = FetchOptions.Builder.withLimit(Constants.PAGE_SIZE);
			PreparedQuery queryString = datastore.prepare(query);
			if (callback!=null) {
				callback.setRecordCount(queryString.countEntities(FetchOptions.Builder.withDefaults()));
			}
			return queryString.asIterable(fetchOptions.offset(offset));
		}
		
	}

	
	public static Iterable<Entity> listChildren(String kind, Key ancestor) {
		Query q = new Query(kind);
		Filter searchFilter = new FilterPredicate(Entity.KEY_RESERVED_PROPERTY,  FilterOperator.GREATER_THAN, ancestor);
		q.setFilter(searchFilter);
		q.setAncestor(ancestor);
		return datastore.prepare(q).asIterable();
	}

	public static Iterable<Entity> listChildKeys(String kind, Key ancestor) {
		logger.log(Level.INFO, "Search entities based on parent");
		Query q = new Query(kind);
		q.setAncestor(ancestor).setKeysOnly();
		q.setFilter(new FilterPredicate(Entity.KEY_RESERVED_PROPERTY,  FilterOperator.GREATER_THAN, ancestor));
		return datastore.prepare(q).asIterable();
	}

	public static String writeJSON(Entity e) {
		List<Entity> entities = new ArrayList<Entity>();
		entities.add(e);
		return writeJSON(entities,null);
		
	}
	public static String writeJSON(Entity e, Map<String,String> moreValues) {
		List<Entity> entities = new ArrayList<Entity>();
		entities.add(e);
		return writeJSON(entities,moreValues);
		
	}
	/**
	 * List the entities in JSON format
	 * 
	 * @param entities
	 *            entities to return as JSON strings
	 */
	public static String writeJSON(Iterable<Entity> entities, Map<String,String> moreValues) {
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
					
					SimpleDateFormat formatShort = new SimpleDateFormat(Constants.DATE_FORMAT);
					
					sb.append("\""
							+ key
							+ "\" : \""
							+ formatShort.format(properties.get(key)) + "\",");
				} else {
					sb.append("\"" + key + "\" : \"" + properties.get(key)
							+ "\",");
				}

			}
			if (moreValues!=null) {
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

	
	
	
	/**
	 * Retrieves Parent and Child entities into JSON String
	 * 
	 * @param entities
	 *            : List of parent entities
	 * @param childKind
	 *            : Entity type for Child
	 * @param fkName
	 *            : foreign-key to the parent in the child entity
	 * @return JSON string
	 */
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
					String.valueOf(result.getKey().getName()),Query.SortDirection.DESCENDING,offset, null, null, null);
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

	/**
	 * Utility method to send the error back to UI
	 * 
	 * @param data
	 * @param resp
	 * @throws IOException
	
	 {
		  "apiVersion": "2.0",
		  "error": {
		    "code": 404,
		    "message": "File Not Found",
		    "errors": [{
		      "domain": "Calendar",
		      "reason": "ResourceNotFoundException",
		      "message": "File Not Found
		    }]
		  }
	}
	 */
	 
	public static String getErrorMessage(Exception ex) throws IOException {
		StringBuilder sb = new StringBuilder();
		sb.append("{");
		
		
				sb.append("\"" + "apiVersion" + "\" : \"" + "1.0"+ "\",");
				sb.append("\"" + "error" + "\" : " + "{" );
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

	public static String getErrorMessage(String errorMessage)  {

		StringBuilder sb = new StringBuilder();
		sb.append("{");
				sb.append("\"" + "apiVersion" + "\" : \"" + "1.0"+ "\",");
				sb.append("\"" + "error" + "\" :" + "{" );
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