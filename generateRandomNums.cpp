#include<iostream>
#include<fstream>
#include<cstdlib>
#include<ctime>
#define maxn 2000
#define random_time 5000
using namespace std;
void random_swap(int *a){
	int *x=a+rand()%maxn;
	int *y=a+rand()%maxn;
	if(x==y)return;
	int tmp=*x;
	*x=*y;
	*y=tmp;
}
int main()
{
	ofstream out("boys-and-girls.js");
	srand(time(NULL));
	int num[maxn];
	//initial
	for(int i=0;i<maxn;i++)num[i]=i;
	//random swap
	for(int i=0;i<random_time;i++){
		random_swap(num);
	}
	//output
	out<<"define(["<<endl;
	for(int i=0;i<maxn;i++){
		//cout<<num[i]<<' ';
		out<<"\""<<num[i]<<"\","<<endl;
	}
	out<<"])";
	out.close();
	return 0;
}