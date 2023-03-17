# Structify [In Development]
## JSON -> Swift Struct
### Example
```json
{
  "data": [
    {
      "address": {
        "state": "CA",
        "street": "123 Main St",
        "zip": "12345"
      },
      "age": 30,
      "name": "John Doe"
    },
    {
      "address": {
        "city": "Anytown",
        "state": "CA",
        "street": "123 Main St",
        "zip": "12345"
      },
      "age": 30.5
    }
  ]
}
```

to

```swift
struct ModelStruct {
    var data: [Data]
}

struct Data {
    var address: Address
    var age: Double
    var name: String?
}

struct Address {
    var city: String
    var state: String
    var street: String
    var zip: String
}

```

## Bugs/Todos
- [ ] An improved user interface
- [ ] Objects nested in arrays are not handled properly
- [ ] It can generate 2 `struct`s of the same name. Which is problematic.
