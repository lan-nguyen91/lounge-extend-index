# Requirement
Node 6+

# Usage
```
let couchbase = require(couchbase);
let lounge = require(lounge);
let loungeExtendIndex = require('lounge-extend-index');

let dbConnection = lounge.connect({
	connectionString : [db_url],
	bucket : [bucket_name]
});

dbConnection.then(function (bucket) {
	// bucket connection is important because extend index
	// will perform actions on the bucket
	if (bucket.connected) {
		loungeExtendIndex(lounge, bucket, {
			customQueryString : 'q' // query string default to `query`
		});
	}
});
```

# Functionlity

`N1qlCreate`

-	Create a n1ql index 

```
	let userSchema = lounge.schema({ 
		username : String,
		email : String
	});
	
	userSchema.N1qlIndex('ByUserNameAndEmail', ['username', 'email');
```

---
`N1qlQuery`

- Smart query language provides 2 options

```
	...
	let UserModel = lounge.model('User', userSchema);
	
	let result = UserModel.N1qlQuery('ByUserNameAndEmail', {
		username : 'John',
		email    : 'john.doe@johndoe.com'
	});
	
	or using custom query string
	// if specify
	let result = UserModel.qByUserNameAndEmail('John', 'john.doe@johndoe.com);
	// default
	let result = UserModel.queryByUserNameAndEmail('John', 'john.doe@johndoe.com);	
	
	result = Promise;
```

---
`find`

- Generic find

```
	result = UserModel.find({
		email : 'john.doe@johndoe.com'
	});
```
---
`findOne`

- Generic findOne

```
	result = UserModel.findOne({
		email : 'john.doe@johndoe.com'
	});
```
---
`findOneAndUpdate`

- Generic findOneAndUpdate

```
	result = UserModel.findOneAndUpdate({
		email : 'john.doe@johndoe.com'
	}, {
		email : 'doe.john@doejohn.com'
	});
```
---
`create`

- create model instance

```
	result = UserModel.create({
		email : 'john.doe@johndoe.com'
	});
```
---
`update`

- update model instance

```
	result = UserModel.update({
		id : '12345'
		email : 'john.doe@johndoe.com'
	});
```
---
# Query with nested model
- keyword load with desired nested model
	- current functionality only support 1 level child model. 

```
	result = UserModel.find({
		id : '12345'
		email : 'john.doe@johndoe.com'
	}, {
			load : { grade :  true }
		}
	);

	load : { // will load all child model
		all : true 
	}
```
---


# Author

-	Lan Nguyen
- 	Yitong Wang