import { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from "expo-sqlite";

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

function openDatabase() {
  const db = SQLite.openDatabase("bmiDB.db");
  return db;
}

const db = openDatabase();

function Items() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select id, height, weight, BMI, date(itemDate) as itemDate from items order by itemDate desc;`,
        [],
        (_, {rows: {_array} }) => setItems(_array)
      );
    });
  }, []);

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <SafeAreaView style={styles.sectionContainer}>
      <Text style={styles.BMIhistory}>BMI History</Text>
      {items.map(({ id, height, weight, BMI, itemDate }) => (
        <Text key={id} style={styles.item}>{itemDate}:   {BMI}  (W:{weight}, H:{height})</Text>
      ))}
    
    </SafeAreaView>
  )

}

export default function App() {
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);
  const [BMI, setBMI] = useState(null);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      //tx.executeSql(
        //"drop table items;"
      //);
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, height int, weight int, BMI int, itemDate real);"
      );
    });
  }, []);

  const add = () => {
  
    if (height === null || height === "") {
      return false;
    }

    if (weight === null || weight === "") {
      return false;
    }

    if (BMI === 'NaN'){
      return false;
    }
    
    
    
    

    db.transaction((tx) => {
      tx.executeSql("insert into items (height, weight, BMI, itemDate) values (?, ?, ?, julianday('now'))", [height, weight, BMI]);
      tx.executeSql("select * from items", [], (_, {rows}) =>
        console.log(JSON.stringify(rows))
      );
    });
  };

  const getBMI = (height, weight) => {
    setBMI(((weight / (height * height)) * 703).toFixed(1))
  }
  
  useEffect(() => {
    if(BMI >= 30) {
      setAssessment("Obese");
    } else if (BMI >= 25) {
      setAssessment("Overweight");
    } else if (BMI >= 18.5) {
      setAssessment("Healthy");
    } else {
      setAssessment("Underweight");
    }
    add(height, weight);
  }, [BMI])

    return(
      <SafeAreaView style={styles.container}>
        <Text style={styles.toolbar}>BMI Calculator</Text>
        <ScrollView style={styles.content}>
          <TextInput 
            style={styles.input}
            onChangeText={(weight) => setWeight(weight)}
            value={weight}
            placeholder="Weight in Pounds"
          />
           <TextInput 
            style={styles.input}
            onChangeText={(height) => setHeight(height)}
            value={height}
            placeholder="Height in Inches"
          />
          <Pressable style={styles.button} 
            onPress={() => {
              getBMI(height, weight);
            }}>
            <Text style={styles.buttonText}>Compute BMI</Text>
          </Pressable>
          <Text style={styles.output}>
          {BMI && BMI !== 'NaN' ? 'Body Mass Index is ' + BMI + '\n(' + assessment + ')' : ''}
          </Text>
          <ScrollView style={styles.listArea}>
            <Items />
          </ScrollView>
          
        </ScrollView>
      </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    backgroundColor: '#f4511e',
    color: '#fff',
    textAlign: 'center',
    padding: 25,
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  input: {
    backgroundColor: '#ecf0f1',
    height: 40,
    padding: 5,
    marginBottom: 10,
    fontSize: 24,
  },
  button: {
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 3,
    marginBottom: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
  },
  output: {
    fontSize: 28,
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  BMIhistory: {
    fontSize: 24,
    marginBottom: 8,
  },
  item: {
    fontSize: 20,
  }
});
