Vector is the catch-all term meaning row or column. It's 1 dimensional 
(technically, a n x 1 or 1 x n matrix), but here we mean 1 dimensional 
in terms of tensor dimension.

The Header Row / Stub Column are examples of vectors in this context.

"Index" in this context is a vector that is either a header row 
or a stub column. Similar to Pandas, there are multiple possible
implementations of an index depending on what the data is, and what
needs to be done with it.

The purpose of this document is explaining how indexes work.

A Index will have _capabilities_ (basically, features),
that we can implement, that represent various tradeoffs. The reason for 
doing this and providing an abstract interface instead of a simple 
concrete implementation is because Tuplex requires a virtualized 
row set, but a materialized column set, at least for now.

Also, allowing an interface means we can defer implementation of more 
advanced index types until we have more certainty on what our users 
or library users actually need.

+------------------+-------------------+--------------------+
| Index capability | OrderedTupleIndex | VirtualKeysetIndex |
+------------------+-------------------+--------------------+
| Reorder          |               Yes |                 No |
| ModifyDimension  |               Yes |                 No |
| ModifyGlobalDim  |               Yes |                 No |
+------------------+-------------------+--------------------+