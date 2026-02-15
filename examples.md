# Ladnik Column Aligner - Usage Examples

## JavaScript/TypeScript
```javascript
// Before:
const user   =  {name         :  "John"              ,  age          :  25           ,  email         :  "john@example.com"};         
const config =  {host         :  "localhost"         ,  port         :  3000         ,  debug         :  true                         ,  ssl         :  false};         

// After:
const user   =   {name    :   "John"        ,   age     :   25     ,   email   :   "john@example.com"};
const config =   {host    :   "localhost"   ,   port    :   3000   ,   debug   :   true                   ,   ssl   :   false};
```

## PHP
```php
// Before:
return [
  'host' => 'localhost',
  'port' => 3306,
  'database' => 'app_db',
  'username' => 'root',
  'password' => '',
  'charset' => 'utf8mb4'
];

// After:
return [
  'host'     => 'localhost',
  'port'     => 3306,
  'database' => 'app_db',
  'username' => 'root',
  'password' => '',
  'charset'  => 'utf8mb4'
];
```

## CSS
```css
/* Before: */
.container {
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-top: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* After: */
.container {
  width           : 100%;
  padding         : 20px;
  background-color: #fff;
  border-radius   : 8px;
  margin-top      : 10px;
  box-shadow      : 0 2px 4px rgba(0,0,0,0.1);
}
```

## Python
```python
# Before:
config = {
    'debug': True,
    'database_url': 'postgresql://localhost/mydb',
    'secret_key': 'my_secret_key',
    'allowed_hosts': ['localhost', '127.0.0.1']
}

# After:
config = {
    'debug'       : True,
    'database_url': 'postgresql://localhost/mydb',
    'secret_key'  : 'my_secret_key',
    'allowed_hosts': ['localhost', '127.0.0.1']
}
```

## JSON
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  }
}
```

## Plain Text Data
```
// Before:
Name = Ivan
Surname = Petrov
Age = 25
City = Moscow
Email = ivan@example.com

// After:
Name    = Ivan
Surname = Petrov
Age     = 25
City    = Moscow
Email   = ivan@example.com
```
