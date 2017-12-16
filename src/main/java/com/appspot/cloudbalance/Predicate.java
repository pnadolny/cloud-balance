package com.appspot.cloudbalance;

public interface Predicate<Entity> {
    boolean test(Entity e);
}
