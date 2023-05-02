import React from "react";
import {View , Text , StyleSheet, TouchableOpacity, ImageBackground ,Image, TextInput, KeyboardAvoidingView, ToastAndroid, Alert} from "react-native";
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../config';


const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");


export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            bookId:'',
            studentId:'',
            domState:'normal',
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            studentName:'',
            bookName:'',
        }
    }

    getCameraPermissions=async domState=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA); //js object destructuring 
        this.setState({

             /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
            hasCameraPermissions:status==='granted',
            domState:domState,
            scanned:false,
        })
    }


    getBookDetails = bookId => {
      bookId = bookId.trim();
      db.collection("books")
        .where("book_id", "==", bookId) // db query
        .get()
        .then(snapshot => {
          snapshot.docs.map(doc => {
            this.setState({
              bookName: doc.data().book_details.book_name
            });
          });
        });
    };
  
    getStudentDetails = studentId => {
      studentId = studentId.trim();
      db.collection("students")
        .where("student_id", "==", studentId)
        .get()
        .then(snapshot => {
          snapshot.docs.map(doc => {
            this.setState({
              studentName: doc.data().student_details.student_name
            });
          });
        });
    };
  

    handleBarCodeScanned = async ({ type, data }) => {
        const { domState } = this.state;
    
        if (domState === "bookId") {
          this.setState({
            bookId: data,
            domState: "normal",
            scanned: true
          });
        } else if (domState === "studentId") {
          this.setState({
            studentId: data,
            domState: "normal",
            scanned: true
          });
        }
      };

      handleTransaction=async()=>{
        var {bookId , studentId , bookName , studentName}=this.state;
        await this.getBookDetails(bookId);
        await this.getStudentDetails(studentId);
        db.collection('books')
        .doc(bookId)
        .get()
        .then(doc => {
          var book = doc.data();
          if (book.is_book_available) {
            this.initiateBookIssue(bookId,studentId,bookName,studentName);

             // For Android users only
          ToastAndroid.show("Book issued to the student!", ToastAndroid.SHORT);
            //Alert.alert('Book has been issued to the student')
          } else {
            this.initiateBookReturn(bookId,studentId,bookName,studentName);

             // For Android users only
          ToastAndroid.show("Book returned to the library", ToastAndroid.SHORT);
           // Alert.alert('Book has been returned to the library')
          }
        });
      }

      initiateBookIssue = async (bookId,studentId,bookName,studentName) => {
       //adding transaction
        db.collection('transactions').add({
          student_id:studentId,
          student_name:studentName,
          book_id:bookId,
          book_name:bookName,
          date:firebase.firestore.Timestamp.now().toDate(),
          transation_type:'issue',
        })

        //changing book status
        db.collection('books').doc(bookId).update({
          is_book_available:false
        })
        
        //chnaging number of books issued to the student
        db.collection('students').doc(studentId).update({
          number_of_books_issued:firebase.firestore.FieldValue.increment(1)
        })

        //updating local states
        this.setState({
          bookId:'',
          studentId:'',
        })
        
      }
            
      initiateBookReturn = async (bookId,studentId,bookName,studentName) => {
        //adding transaction
         db.collection('transactions').add({
           student_id:studentId,
           student_name:studentName,
           book_id:bookId,
           book_name:bookName,
           date:firebase.firestore.Timestamp.now().toDate(),
           transation_type:'return',
         })
 
         //changing book status
         db.collection('books').doc(bookId).update({
           is_book_available:true
         })
         
         //chnaging number of books issued to the student
         db.collection('students').doc(studentId).update({
           number_of_books_issued:firebase.firestore.FieldValue.increment(-1)
         })
 
         //updating local states
         this.setState({
           bookId:'',
           studentId:'',
         })
         
       }
             

    render(){
    
        const { domState, scanned, bookId, studentId } = this.state;

                if(domState==='scanner'){
            return(
                <BarCodeScanner 
                    onBarCodeScanned={scanned?undefined:this.handelBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            )
        }
        
        return(

            <KeyboardAvoidingView behavior='padding' style={styles.container}>
                <ImageBackground source={bgImage} style={styles.bgImage} >
                    <View style={styles.upperContainer}>
                    <Image source={appIcon} style={styles.appIcon} />
                    <Image source={appName} style={styles.appName} />
                    </View>
                    <View  style={styles.lowerContainer}>
                    <View style={styles.textinputContainer}>
                    <TextInput
                    onChangeText={(text)=>this.setState({bookId:text})}
                    style={styles.textinput}
                    placeholder={"Book Id"}
                    placeholderTextColor={"#FFFFFF"}
                    value={bookId}
                    />
                    <TouchableOpacity
                    style={styles.scanbutton}
                    onPress={() => this.getCameraPermissions("bookId")}
                    >
                    <Text style={styles.scanbuttonText}>Scan</Text>
                    </TouchableOpacity>
                    </View>
                    <View style={[styles.textinputContainer, { marginTop: 25 }]}>
                    <TextInput
                    onChangeText={(text)=>this.setState({studentId:text})}
                    style={styles.textinput}
                    placeholder={"Student Id"}
                    placeholderTextColor={"#FFFFFF"}
                    value={studentId}
                />
                    <TouchableOpacity
                    style={styles.scanbutton}
                    onPress={() => this.getCameraPermissions("studentId")}
                    >
                  <Text style={styles.scanbuttonText}>Scan</Text>
                </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.scanbutton,{marginTop:25}]} onPress={this.handleTransaction} >
                      <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>

                    
                    </View>  
                </ImageBackground>
            </KeyboardAvoidingView>
        )
    }    
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF"
    },
    bgImage: {
      flex: 1,
      resizeMode: "cover",
      justifyContent: "center"
    },
    upperContainer: {
      flex: 0.5,
      justifyContent: "center",
      alignItems: "center"
    },
    appIcon: {
      width: 200,
      height: 200,
      resizeMode: "contain",
      marginTop: 80
    },
    appName: {
      width: 80,
      height: 80,
      resizeMode: "contain"
    },
    lowerContainer: {
      flex: 0.5,
      alignItems: "center"
    },
    textinputContainer: {
      borderWidth: 2,
      borderRadius: 10,
      flexDirection: "row",
      backgroundColor: "#9DFD24",
      borderColor: "#FFFFFF"
    },
    textinput: {
      width: "57%",
      height: 50,
      padding: 10,
      borderColor: "#FFFFFF",
      borderRadius: 10,
      borderWidth: 3,
      fontSize: 18,
      backgroundColor: "#5653D4",
      fontFamily: "Rajdhani_600SemiBold",
      color: "#FFFFFF"
    },
    scanbutton: {
      width: 100,
      height: 50,
      backgroundColor: "#9DFD24",
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      justifyContent: "center",
      alignItems: "center"
    },
    scanbuttonText: {
      fontSize: 24,
      color: "#0A0101",
      fontFamily: "Rajdhani_600SemiBold"
    }
  });